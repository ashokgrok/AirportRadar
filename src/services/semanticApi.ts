import { KEY_KPIS, AIRPORT_PROFILE, EMBEDDED_SCENARIOS } from '../data/kpiLibrary';
import { 
  KpiValueResult, 
  UserRole, 
  RagStatus, 
  FlightRecord, 
  QueueRecord, 
  ActionItem,
  CommercialConcessionRecord,
  ParkingSessionRecord,
  CommercialDrivingVariables
} from '../types';
import { querySql } from '../db/pglite';

export interface SemanticQueryFilters {
  dateRange: string;
  terminal: string;
  airline: string;
  activeScenarioId?: string | null;
}

export async function fetchKpiValues(
  filters: SemanticQueryFilters,
  user: UserRole
): Promise<KpiValueResult[]> {
  const activeScenario = EMBEDDED_SCENARIOS.find(s => s.id === filters.activeScenarioId);

  // Filter out restricted KPIs if user lacks permissions
  const accessibleKpis = KEY_KPIS.filter(kpi => {
    if (kpi.sensitivity === 'Restricted') {
      if (kpi.domain.includes('Security') && user.department !== 'Security' && user.department !== 'Executive Office') {
        return false;
      }
    }
    return true;
  });

  return accessibleKpis.map(kpi => {
    let baseVal = kpi.target2026;
    let target = kpi.target2026;
    let tolerance = kpi.tolerance;

    // Apply baseline operational variance
    if (kpi.polarity === 'Higher is Better') {
      baseVal = Number((target * (0.97 + Math.random() * 0.05)).toFixed(2));
    } else if (kpi.polarity === 'Lower is Better') {
      baseVal = Number((target * (0.95 + Math.random() * 0.08)).toFixed(2));
    } else {
      baseVal = Number((target * (0.98 + Math.random() * 0.03)).toFixed(2));
    }

    // Apply scenario mutations if active
    if (activeScenario) {
      if (activeScenario.id === 'winter-fog') {
        if (kpi.code === 'PUN-01') baseVal = 41.2;
        if (kpi.code === 'PUN-02') baseVal = 8.6;
        if (kpi.code === 'ASD-01') baseVal = 58.0;
        if (kpi.code === 'ASD-02') baseVal = 16.4;
        // Stranded passengers impact: higher F&B spend, lower luxury retail, high parking overstay
        if (kpi.code === 'COM-01') baseVal = 382.0;
        if (kpi.code === 'COM-03') baseVal = 17.6;
        if (kpi.code === 'COM-06') baseVal = 164.0;
        if (kpi.code === 'COM-08') baseVal = 340.0;
      } else if (activeScenario.id === 'diwali-peak') {
        if (kpi.code === 'COM-01') baseVal = 448.0;
        if (kpi.code === 'COM-02') baseVal = 52.4;
        if (kpi.code === 'COM-03') baseVal = 27.5;
        if (kpi.code === 'COM-04') baseVal = 21600.0;
        if (kpi.code === 'COM-05') baseVal = 1750.0;
        if (kpi.code === 'COM-06') baseVal = 155.0;
        if (kpi.code === 'COM-07') baseVal = 74.0;
        if (kpi.code === 'COM-08') baseVal = 315.0;
        if (kpi.code === 'COM-09') baseVal = 44.0;
        if (kpi.code === 'COM-10') baseVal = 15.8;
        if (kpi.code === 'PAX-01') baseVal = 19.4;
        if (kpi.code === 'LND-01') baseVal = 8.8;
      } else if (activeScenario.id === 'bhs-outage') {
        if (kpi.code === 'BAG-01') baseVal = 34.5;
        if (kpi.code === 'BAG-02') baseVal = 11.4;
        if (kpi.code === 'BAG-03') baseVal = 89.2;
        if (kpi.code === 'AST-01') baseVal = 94.1;
      } else if (activeScenario.id === 'security-shortfall') {
        if (kpi.code === 'PAX-01') baseVal = 28.5;
        if (kpi.code === 'WFM-01') baseVal = 76.0;
        if (kpi.code === 'GOV-01') baseVal = 88.0;
      } else if (activeScenario.id === 'aca-upgrade') {
        if (kpi.code === 'ENV-01') baseVal = 1.72;
        if (kpi.code === 'ENV-02') baseVal = 65.4;
      } else if (activeScenario.id === 'monsoon-storm') {
        if (kpi.code === 'ASD-01') baseVal = 44.0;
        if (kpi.code === 'PUN-01') baseVal = 54.0;
      } else if (activeScenario.id === 'ransomware-contained') {
        if (kpi.code === 'ITD-01') baseVal = 99.96;
        if (kpi.code === 'ITD-02') baseVal = 4.0;
      }
    }

    // Role-specific row level security adjustment
    if (user.scopeType === 'airline' && user.scopeValue) {
      if (kpi.code === 'PUN-01') {
        // e.g. IndiGo 6E performs slightly better or specific to carrier
        baseVal = user.scopeValue === '6E' ? 88.4 : 83.1;
      }
    }

    // Calculate RAG Status
    let status: RagStatus = 'green';
    if (kpi.polarity === 'Higher is Better') {
      if (baseVal >= target) {
        status = 'green';
      } else if (baseVal >= target * (1 - tolerance)) {
        status = 'amber';
      } else {
        status = 'red';
      }
    } else if (kpi.polarity === 'Lower is Better') {
      if (baseVal <= target) {
        status = 'green';
      } else if (baseVal <= target * (1 + tolerance)) {
        status = 'amber';
      } else {
        status = 'red';
      }
    } else if (kpi.polarity === 'Within Band') {
      const lower = target * (1 - tolerance);
      const upper = target * (1 + tolerance);
      if (baseVal >= lower && baseVal <= upper) {
        status = 'green';
      } else if (baseVal >= lower * 0.95 && baseVal <= upper * 1.05) {
        status = 'amber';
      } else {
        status = 'red';
      }
    } else {
      status = 'monitor';
    }

    // Generate 13-period trend history
    const trend: number[] = [];
    const prev = Number((baseVal * (0.95 + Math.random() * 0.08)).toFixed(2));
    for (let i = 12; i >= 0; i--) {
      const noise = (Math.sin(i * 0.8) * 0.05) + ((Math.random() - 0.5) * 0.03);
      trend.push(Number((baseVal * (1 - noise * (i / 12))).toFixed(2)));
    }
    trend[12] = baseVal;

    const changePct = Number((((baseVal - prev) / (prev || 1)) * 100).toFixed(1));

    // Conformed numerators and denominators for exact drilldowns
    let numerator = Math.round(baseVal * 100);
    let denominator = 100;
    if (kpi.code === 'COM-01') {
      denominator = 48500; // Enplaned passengers
      numerator = Math.round(baseVal * denominator); // Total Non-Aero Concession Rev (₹)
    } else if (kpi.code === 'COM-02') {
      denominator = 44200000; // Total Operating Airport Rev (₹)
      numerator = Math.round((baseVal / 100) * denominator); // Non-Aero Rev (₹)
    } else if (kpi.code === 'COM-03') {
      denominator = 92000; // Total Terminal Pax
      numerator = Math.round((baseVal / 100) * denominator); // Transacting Customers
    } else if (kpi.code === 'COM-04') {
      denominator = 8400; // Total Retail Concession Floor Area (m²)
      numerator = Math.round(baseVal * denominator); // Concession Fee (₹)
    } else if (kpi.code === 'COM-05') {
      denominator = 44800; // Total Retail Transactions
      numerator = Math.round(baseVal * denominator); // Gross Retail Sales (₹)
    } else if (kpi.code === 'COM-06') {
      denominator = 92000; // Total Terminal Pax
      numerator = Math.round(baseVal * denominator); // F&B Concession Rev (₹)
    } else if (kpi.code === 'COM-07') {
      denominator = 48500; // Departing Passengers
      numerator = Math.round(baseVal * denominator); // Car Parking Rev (₹)
    } else if (kpi.code === 'COM-08') {
      denominator = 10800; // Parked Vehicles
      numerator = Math.round(baseVal * denominator); // Total Parking Toll Rev (₹)
    } else if (kpi.code === 'COM-09') {
      denominator = 92000; // Terminal Pax
      numerator = Math.round(baseVal * denominator); // Advertising Rev (₹)
    } else if (kpi.code === 'COM-10') {
      denominator = 44200000; // Total Operating Rev (₹)
      numerator = Math.round((baseVal / 100) * denominator); // Property Leasing (₹)
    } else if (kpi.unit === '%') {
      denominator = 480; // movements or checks
      numerator = Math.round((baseVal / 100) * denominator);
    } else if (kpi.unit.includes('min')) {
      denominator = 340;
      numerator = Math.round(baseVal * denominator);
    } else if (kpi.unit.includes('₹')) {
      denominator = 42000; // passengers
      numerator = Math.round(baseVal * denominator);
    }

    return {
      kpiId: kpi.id,
      code: kpi.code,
      name: kpi.name,
      domain: kpi.domain,
      tier: kpi.tier,
      unit: kpi.unit,
      polarity: kpi.polarity,
      currentValue: baseVal,
      target,
      previousValue: prev,
      numerator,
      denominator,
      changePct,
      status,
      trend,
      dataQuality: kpi.dataQualityScore,
      controllability: kpi.controllability,
      airportControllableDelay: kpi.code === 'PUN-01' ? 1.8 : undefined,
      formula: kpi.formulaText,
      owner: kpi.ownerFunction,
      standard: kpi.standard
    };
  });
}

export async function fetchLiveFlights(user: UserRole): Promise<FlightRecord[]> {
  let sql = 'SELECT * FROM fact_flight_movement';
  const params: any[] = [];

  if (user.scopeType === 'airline' && user.scopeValue) {
    sql += ' WHERE airline_code = $1';
    params.push(user.scopeValue);
  } else if (user.scopeType === 'terminal' && user.scopeValue) {
    sql += ' WHERE terminal = $1';
    params.push(user.scopeValue);
  }

  sql += ' ORDER BY scheduled_time ASC LIMIT 60';
  const rows = await querySql(sql, params);

  return rows.map(r => ({
    id: r.id,
    flightNumber: r.flight_number,
    airlineCode: r.airline_code,
    airlineName: r.airline_code === '6E' ? 'IndiGo' : r.airline_code === 'AI' ? 'Air India' : r.airline_code,
    originDest: r.origin_dest,
    movementType: r.movement_type,
    scheduledTime: r.scheduled_time,
    actualTime: r.actual_time,
    terminal: r.terminal,
    stand: r.stand,
    runway: r.runway,
    aircraftType: r.aircraft_type,
    paxCount: r.pax_count,
    bagCount: r.bag_count,
    delayMinutes: r.delay_minutes,
    delayCode: r.delay_code || 'None',
    delayCategory: r.delay_category || 'Routine',
    delayControllable: r.delay_controllable,
    status: r.status
  }));
}

export async function fetchLiveQueues(terminal?: string): Promise<QueueRecord[]> {
  let sql = 'SELECT * FROM fact_queue_interval';
  const params: any[] = [];
  if (terminal && terminal !== 'ALL') {
    sql += ' WHERE terminal = $1';
    params.push(terminal);
  }
  sql += ' ORDER BY timestamp DESC LIMIT 20';
  const rows = await querySql(sql, params);

  return rows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    checkpoint: r.checkpoint,
    terminal: r.terminal,
    lanesOpen: r.lanes_open,
    lanesPlanned: r.lanes_planned,
    waitMinutesP50: r.wait_p50,
    waitMinutesP90: r.wait_p90,
    paxProcessed: r.pax_served
  }));
}

export async function fetchActionItems(): Promise<ActionItem[]> {
  const rows = await querySql('SELECT * FROM fact_action_item ORDER BY due_date ASC');
  return rows.map(r => ({
    id: r.id,
    kpiId: r.kpi_id,
    title: r.title,
    owner: r.owner,
    department: r.department,
    dueDate: r.due_date,
    status: r.status,
    priority: r.priority,
    rootCause: r.root_cause
  }));
}

export async function createActionItem(item: ActionItem, user: UserRole): Promise<void> {
  await querySql(`
    INSERT INTO fact_action_item (id, kpi_id, title, owner, department, due_date, status, priority, root_cause)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    item.id,
    item.kpiId,
    item.title,
    item.owner,
    item.department,
    item.dueDate,
    item.status,
    item.priority,
    item.rootCause
  ]);

  await querySql(`
    INSERT INTO audit_log (user_id, user_name, action, details)
    VALUES ($1, $2, 'CREATE_ACTION_ITEM', $3)
  `, [user.id, user.name, `Created corrective action ${item.id} for ${item.kpiId}`]);
}

export async function fetchAuditLogs(): Promise<any[]> {
  return await querySql('SELECT * FROM audit_log ORDER BY id DESC LIMIT 50');
}

export async function fetchTargetProposals(): Promise<import('../types').TargetProposal[]> {
  try {
    await querySql(`
      CREATE TABLE IF NOT EXISTS cfg_target_proposal (
        id VARCHAR(50) PRIMARY KEY,
        kpi_id VARCHAR(50) NOT NULL,
        kpi_code VARCHAR(20) NOT NULL,
        kpi_name VARCHAR(150) NOT NULL,
        current_value NUMERIC NOT NULL,
        current_target NUMERIC NOT NULL,
        proposed_target NUMERIC NOT NULL,
        unit VARCHAR(20) NOT NULL,
        proposer_id VARCHAR(50) NOT NULL,
        proposer_name VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        justification TEXT NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by VARCHAR(100),
        reviewed_at TIMESTAMP
      )
    `);

    const rows = await querySql('SELECT * FROM cfg_target_proposal ORDER BY created_at DESC');
    if (rows.length === 0) {
      // Seed default sample proposal
      const sample = {
        id: 'PROP-2026-001',
        kpi_id: 'kpi-pun-01',
        kpi_code: 'PUN-01',
        kpi_name: 'On-Time Departure Performance (OTP-15)',
        current_value: 84.8,
        current_target: 87.0,
        proposed_target: 88.5,
        unit: '%',
        proposer_id: 'aocc-duty-mgr',
        proposer_name: 'Vikram Malhotra',
        department: 'Operations Control',
        justification: 'Post-monsoon A-CDM milestone compliance improvement with IndiGo and Air India.',
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      await querySql(`
        INSERT INTO cfg_target_proposal (id, kpi_id, kpi_code, kpi_name, current_value, current_target, proposed_target, unit, proposer_id, proposer_name, department, justification, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [sample.id, sample.kpi_id, sample.kpi_code, sample.kpi_name, sample.current_value, sample.current_target, sample.proposed_target, sample.unit, sample.proposer_id, sample.proposer_name, sample.department, sample.justification, sample.status, sample.created_at]);
      return [{
        id: sample.id,
        kpiId: sample.kpi_id,
        kpiCode: sample.kpi_code,
        kpiName: sample.kpi_name,
        currentValue: sample.current_value,
        currentTarget: sample.current_target,
        proposedTarget: sample.proposed_target,
        unit: sample.unit,
        proposerId: sample.proposer_id,
        proposerName: sample.proposer_name,
        department: sample.department,
        justification: sample.justification,
        status: 'Pending',
        createdAt: sample.created_at
      }];
    }

    return rows.map(r => ({
      id: r.id,
      kpiId: r.kpi_id,
      kpiCode: r.kpi_code,
      kpiName: r.kpi_name,
      currentValue: Number(r.current_value),
      currentTarget: Number(r.current_target),
      proposedTarget: Number(r.proposed_target),
      unit: r.unit,
      proposerId: r.proposer_id,
      proposerName: r.proposer_name,
      department: r.department,
      justification: r.justification,
      status: r.status,
      createdAt: r.created_at,
      reviewedBy: r.reviewed_by,
      reviewedAt: r.reviewed_at
    }));
  } catch (err) {
    console.error('Failed fetching target proposals:', err);
    return [];
  }
}

export async function createTargetProposal(proposal: Omit<import('../types').TargetProposal, 'id' | 'createdAt' | 'status'>, user: UserRole): Promise<void> {
  const id = `PROP-2026-00${Math.floor(Math.random() * 900) + 100}`;
  await querySql(`
    INSERT INTO cfg_target_proposal (id, kpi_id, kpi_code, kpi_name, current_value, current_target, proposed_target, unit, proposer_id, proposer_name, department, justification, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Pending')
  `, [
    id,
    proposal.kpiId,
    proposal.kpiCode,
    proposal.kpiName,
    proposal.currentValue,
    proposal.currentTarget,
    proposal.proposedTarget,
    proposal.unit,
    user.id,
    user.name,
    user.department,
    proposal.justification
  ]);

  await querySql(`
    INSERT INTO audit_log (user_id, user_name, action, details)
    VALUES ($1, $2, 'PROPOSE_TARGET', $3)
  `, [user.id, user.name, `Submitted target proposal ${id} for ${proposal.kpiCode}: ${proposal.proposedTarget} ${proposal.unit}`]);
}

export async function reviewTargetProposal(proposalId: string, status: 'Approved' | 'Rejected', reviewer: UserRole): Promise<void> {
  const now = new Date().toISOString();
  await querySql(`
    UPDATE cfg_target_proposal
    SET status = $1, reviewed_by = $2, reviewed_at = $3
    WHERE id = $4
  `, [status, reviewer.name, now, proposalId]);

  await querySql(`
    INSERT INTO audit_log (user_id, user_name, action, details)
    VALUES ($1, $2, 'MAKER_CHECKER_REVIEW', $3)
  `, [reviewer.id, reviewer.name, `${status} target change proposal ${proposalId}`]);
}

export async function fetchKpiComments(kpiCode?: string): Promise<import('../types').KpiComment[]> {
  try {
    await querySql(`
      CREATE TABLE IF NOT EXISTS fact_kpi_comment (
        id VARCHAR(50) PRIMARY KEY,
        kpi_id VARCHAR(50) NOT NULL,
        kpi_code VARCHAR(20) NOT NULL,
        period_index INT NOT NULL,
        period_label VARCHAR(50) NOT NULL,
        author VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let sql = 'SELECT * FROM fact_kpi_comment';
    const params: any[] = [];
    if (kpiCode) {
      sql += ' WHERE kpi_code = $1';
      params.push(kpiCode);
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await querySql(sql, params);
    if (rows.length === 0 && !kpiCode) {
      // Seed sample period commentary
      const sample = {
        id: 'COM-001',
        kpi_id: 'kpi-pun-01',
        kpi_code: 'PUN-01',
        period_index: 8,
        period_label: 'Jan 2026 (Winter Fog)',
        author: 'Vikram Malhotra',
        department: 'Operations Control',
        text: 'Dense northern fog forced CAT III-B low-visibility procedures. Peak departure rate reduced to 34 mvmt/hr; 38 flights diverted.',
        created_at: new Date().toISOString()
      };
      await querySql(`
        INSERT INTO fact_kpi_comment (id, kpi_id, kpi_code, period_index, period_label, author, department, text, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [sample.id, sample.kpi_id, sample.kpi_code, sample.period_index, sample.period_label, sample.author, sample.department, sample.text, sample.created_at]);
      return [{
        id: sample.id,
        kpiId: sample.kpi_id,
        kpiCode: sample.kpi_code,
        periodIndex: sample.period_index,
        periodLabel: sample.period_label,
        author: sample.author,
        department: sample.department,
        text: sample.text,
        createdAt: sample.created_at
      }];
    }

    return rows.map(r => ({
      id: r.id,
      kpiId: r.kpi_id,
      kpiCode: r.kpi_code,
      periodIndex: Number(r.period_index),
      periodLabel: r.period_label,
      author: r.author,
      department: r.department,
      text: r.text,
      createdAt: r.created_at
    }));
  } catch (err) {
    console.error('Failed fetching commentary:', err);
    return [];
  }
}

export async function createKpiComment(comment: Omit<import('../types').KpiComment, 'id' | 'createdAt'>, user: UserRole): Promise<void> {
  const id = `COM-${Date.now()}`;
  await querySql(`
    INSERT INTO fact_kpi_comment (id, kpi_id, kpi_code, period_index, period_label, author, department, text)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    id,
    comment.kpiId,
    comment.kpiCode,
    comment.periodIndex,
    comment.periodLabel,
    user.name,
    user.department,
    comment.text
  ]);

  await querySql(`
    INSERT INTO audit_log (user_id, user_name, action, details)
    VALUES ($1, $2, 'ADD_KPI_COMMENT', $3)
  `, [user.id, user.name, `Annotated period for ${comment.kpiCode}: "${comment.text.slice(0, 40)}..."`]);
}

export async function fetchCommercialConcessions(
  filters?: Partial<SemanticQueryFilters>,
  user?: UserRole
): Promise<CommercialConcessionRecord[]> {
  try {
    let sql = 'SELECT * FROM fact_concession_sales';
    const params: any[] = [];
    if (filters?.terminal && filters.terminal !== 'ALL') {
      sql += ' WHERE terminal = $1';
      params.push(filters.terminal);
    }
    sql += ' ORDER BY gross_sales DESC';
    const rows = await querySql(sql, params);

    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: r.id,
        outletId: r.outlet_id,
        tenantName: r.tenant_name,
        stream: r.stream,
        subCategory: r.sub_category,
        terminal: r.terminal,
        locationZone: r.location_zone,
        sqmArea: Number(r.sqm_area),
        grossSales: user && !user.canViewTenantRevenue ? Math.round(Number(r.gross_sales) * 0.9) : Number(r.gross_sales),
        concessionFee: user && !user.canViewTenantRevenue ? 0 : Number(r.concession_fee),
        transactionCount: Number(r.transaction_count),
        transactingCustomers: Number(r.transacting_customers),
        totalFootfall: Number(r.total_footfall),
        averageTransactionValue: Number(r.average_transaction_value),
        salesPerSqm: Number(r.sales_per_sqm),
        passengerType: r.passenger_type,
        passengerProfile: r.passenger_profile,
        averageDwellMinutes: Number(r.average_dwell_minutes),
        periodTimestamp: r.period_timestamp
      }));
    }
  } catch (err) {
    console.warn('Querying fact_concession_sales failed, returning conformed fallback:', err);
  }

  // Fallback conformed records
  return [
    {
      id: 1,
      outletId: 'OUT-DF-01',
      tenantName: 'Dufry Duty Free MegaStore',
      stream: 'Retail & Duty-Free',
      subCategory: 'Duty Free Liquor, Perfume & Luxury',
      terminal: 'T2',
      locationZone: 'Central International Departure Plaza',
      sqmArea: 420,
      grossSales: 48200000,
      concessionFee: 9640000,
      transactionCount: 18200,
      transactingCustomers: 18200,
      totalFootfall: 53200,
      averageTransactionValue: 2648,
      salesPerSqm: 22952,
      passengerType: 'International',
      passengerProfile: 'Leisure',
      averageDwellMinutes: 78,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 2,
      outletId: 'OUT-FB-01',
      tenantName: 'Starbucks Reserve & Bakery',
      stream: 'Food & Beverage',
      subCategory: 'Specialty Coffee & Grab-and-Go',
      terminal: 'T2',
      locationZone: 'Airside Central Concourse',
      sqmArea: 85,
      grossSales: 14600000,
      concessionFee: 2920000,
      transactionCount: 32400,
      transactingCustomers: 32400,
      totalFootfall: 68000,
      averageTransactionValue: 450,
      salesPerSqm: 34352,
      passengerType: 'International',
      passengerProfile: 'Business',
      averageDwellMinutes: 42,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 3,
      outletId: 'OUT-RT-01',
      tenantName: 'Forest Essentials Luxury Ayurveda',
      stream: 'Retail & Duty-Free',
      subCategory: 'Ayurvedic Skincare & Cosmetics',
      terminal: 'T2',
      locationZone: 'Departure Pier Alpha Gate 14',
      sqmArea: 60,
      grossSales: 9800000,
      concessionFee: 1960000,
      transactionCount: 4200,
      transactingCustomers: 4200,
      totalFootfall: 21000,
      averageTransactionValue: 2330,
      salesPerSqm: 32666,
      passengerType: 'International',
      passengerProfile: 'Leisure',
      averageDwellMinutes: 65,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 4,
      outletId: 'OUT-FB-02',
      tenantName: 'Haldiram\'s & Street Food of India',
      stream: 'Food & Beverage',
      subCategory: 'Ethnic QSR & Regional Confectionery',
      terminal: 'T1',
      locationZone: 'Domestic Food Court Mezzanine',
      sqmArea: 160,
      grossSales: 11200000,
      concessionFee: 2240000,
      transactionCount: 38000,
      transactingCustomers: 38000,
      totalFootfall: 95000,
      averageTransactionValue: 295,
      salesPerSqm: 14000,
      passengerType: 'Domestic',
      passengerProfile: 'Leisure',
      averageDwellMinutes: 52,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 5,
      outletId: 'OUT-RT-02',
      tenantName: 'Hamleys World of Wonder',
      stream: 'Retail & Duty-Free',
      subCategory: 'Experiential Toys & Gifting',
      terminal: 'T1',
      locationZone: 'Airside Pier Bravo',
      sqmArea: 95,
      grossSales: 5400000,
      concessionFee: 1080000,
      transactionCount: 3800,
      transactingCustomers: 3800,
      totalFootfall: 24000,
      averageTransactionValue: 1420,
      salesPerSqm: 11368,
      passengerType: 'Domestic',
      passengerProfile: 'Leisure',
      averageDwellMinutes: 58,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 6,
      outletId: 'OUT-RT-03',
      tenantName: 'Hugo Boss & Tumi Travel Lounge',
      stream: 'Retail & Duty-Free',
      subCategory: 'Designer Apparel & Luggage',
      terminal: 'T2',
      locationZone: 'International Luxury Avenue',
      sqmArea: 110,
      grossSales: 16800000,
      concessionFee: 3360000,
      transactionCount: 1420,
      transactingCustomers: 1420,
      totalFootfall: 12000,
      averageTransactionValue: 11830,
      salesPerSqm: 30545,
      passengerType: 'International',
      passengerProfile: 'Business',
      averageDwellMinutes: 38,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 7,
      outletId: 'OUT-FB-03',
      tenantName: 'Chai Point & Subway Express',
      stream: 'Food & Beverage',
      subCategory: 'Fast-Casual Food & Beverages',
      terminal: 'T1',
      locationZone: 'Boarding Gate Hub 4-8',
      sqmArea: 45,
      grossSales: 4900000,
      concessionFee: 980000,
      transactionCount: 22000,
      transactingCustomers: 22000,
      totalFootfall: 72000,
      averageTransactionValue: 222,
      salesPerSqm: 21777,
      passengerType: 'Domestic',
      passengerProfile: 'Business',
      averageDwellMinutes: 32,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 8,
      outletId: 'OUT-AD-01',
      tenantName: 'Times OOH / JCDecaux Digital Curvature',
      stream: 'Advertising & Media',
      subCategory: 'Terminal Digital Synced Billboards',
      terminal: 'T2',
      locationZone: 'Arrival Baggage Reclaim & Airside Curvature',
      sqmArea: 180,
      grossSales: 24000000,
      concessionFee: 12000000,
      transactionCount: 42,
      transactingCustomers: 42,
      totalFootfall: 180000,
      averageTransactionValue: 571428,
      salesPerSqm: 66666,
      passengerType: 'International',
      passengerProfile: 'Business',
      averageDwellMinutes: 48,
      periodTimestamp: new Date().toISOString()
    },
    {
      id: 9,
      outletId: 'OUT-RE-01',
      tenantName: 'Aerotropolis Cargo City & Hotel Radisson',
      stream: 'Property & Real Estate',
      subCategory: 'Landside Real Estate & Cargo Warehousing',
      terminal: 'T1',
      locationZone: 'ZZA Aerotropolis Commercial Park',
      sqmArea: 12500,
      grossSales: 82000000,
      concessionFee: 82000000,
      transactionCount: 14,
      transactingCustomers: 14,
      totalFootfall: 12500,
      averageTransactionValue: 5857142,
      salesPerSqm: 6560,
      passengerType: 'Domestic',
      passengerProfile: 'Business',
      averageDwellMinutes: 120,
      periodTimestamp: new Date().toISOString()
    }
  ];
}

export async function fetchParkingSessions(user?: UserRole): Promise<ParkingSessionRecord[]> {
  try {
    const rows = await querySql('SELECT * FROM fact_parking_sessions ORDER BY id DESC');
    if (rows && rows.length > 0) {
      return rows.map(r => ({
        id: r.id,
        ticketId: r.ticket_id,
        terminal: r.terminal,
        zoneName: r.zone_name,
        vehicleType: r.vehicle_type,
        entryTime: r.entry_time,
        exitTime: r.exit_time,
        durationHours: Number(r.duration_hours),
        revenueAmount: Number(r.revenue_amount),
        occupancyStatus: r.occupancy_status
      }));
    }
  } catch (err) {
    console.warn('Querying fact_parking_sessions failed, returning fallback:', err);
  }

  return [
    { id: 1, ticketId: 'PKT-2026-1001', terminal: 'T1', zoneName: 'Short-Term Premium', vehicleType: 'Private Car', entryTime: '2026-10-13T08:00:00Z', exitTime: '2026-10-13T10:12:00Z', durationHours: 2.2, revenueAmount: 220, occupancyStatus: 'Completed' },
    { id: 2, ticketId: 'PKT-2026-1002', terminal: 'T2', zoneName: 'Short-Term Premium', vehicleType: 'Private Car', entryTime: '2026-10-13T07:15:00Z', exitTime: '2026-10-13T10:21:00Z', durationHours: 3.1, revenueAmount: 330, occupancyStatus: 'Occupied' },
    { id: 3, ticketId: 'PKT-2026-1003', terminal: 'T1', zoneName: 'Multi-Day Long Term', vehicleType: 'Private Car', entryTime: '2026-10-10T12:00:00Z', exitTime: '2026-10-13T14:00:00Z', durationHours: 74.0, revenueAmount: 1850, occupancyStatus: 'Completed' },
    { id: 4, ticketId: 'PKT-2026-1004', terminal: 'T2', zoneName: 'Multi-Day Long Term', vehicleType: 'Private Car', entryTime: '2026-10-09T08:00:00Z', exitTime: '2026-10-13T16:00:00Z', durationHours: 96.0, revenueAmount: 2400, occupancyStatus: 'Occupied' },
    { id: 5, ticketId: 'PKT-2026-1005', terminal: 'T2', zoneName: 'Valet Terminal', vehicleType: 'Private Car', entryTime: '2026-10-13T06:00:00Z', exitTime: '2026-10-13T10:30:00Z', durationHours: 4.5, revenueAmount: 650, occupancyStatus: 'Completed' },
    { id: 6, ticketId: 'PKT-2026-1006', terminal: 'T1', zoneName: 'Commercial Taxi Staging', vehicleType: 'Commercial Taxi', entryTime: '2026-10-13T09:20:00Z', exitTime: '2026-10-13T10:14:00Z', durationHours: 0.9, revenueAmount: 90, occupancyStatus: 'Completed' },
    { id: 7, ticketId: 'PKT-2026-1007', terminal: 'T2', zoneName: 'Commercial Taxi Staging', vehicleType: 'Commercial Taxi', entryTime: '2026-10-13T09:00:00Z', exitTime: '2026-10-13T10:15:00Z', durationHours: 1.1, revenueAmount: 110, occupancyStatus: 'Occupied' }
  ];
}

export async function fetchCommercialDrivingVariables(): Promise<CommercialDrivingVariables> {
  return {
    trafficMix: {
      internationalPaxShare: 26.5,
      domesticPaxShare: 73.5,
      internationalSpendPerPax: 1180.0,
      domesticSpendPerPax: 295.0,
      internationalPenetrationRate: 34.2,
      domesticPenetrationRate: 14.8
    },
    passengerProfile: {
      businessShare: 32.0,
      leisureShare: 68.0,
      businessAvgDwellMin: 38,
      leisureAvgDwellMin: 76,
      businessAtv: 520.0,
      leisureAtv: 1850.0
    },
    dwellTimeElasticity: {
      under30MinSpend: 112.0,
      min30To60Spend: 310.0,
      min60To90Spend: 625.0,
      over90MinSpend: 1140.0
    }
  };
}


