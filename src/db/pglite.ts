import { PGlite } from '@electric-sql/pglite';
import { KEY_KPIS, AIRPORT_PROFILE, SEEDED_ROLES } from '../data/kpiLibrary';

let dbInstance: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

export async function getDb(): Promise<PGlite> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Try persistent IndexedDB first
      const db = new PGlite('idb://aionos-zza-db');
      await db.waitReady;
      await setupSchemaAndSeed(db);
      dbInstance = db;
      return db;
    } catch (err) {
      console.warn('Falling back to in-memory PGlite instance:', err);
      const db = new PGlite();
      await db.waitReady;
      await setupSchemaAndSeed(db);
      dbInstance = db;
      return db;
    }
  })();

  return initPromise;
}

export async function querySql<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const res = await db.query(sql, params);
  return (res.rows || []) as T[];
}

export async function executeSql(sql: string, params: any[] = []): Promise<void> {
  const db = await getDb();
  await db.query(sql, params);
}

async function setupSchemaAndSeed(db: PGlite): Promise<void> {
  // Create core schema tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cfg_airport_profile (
      id SERIAL PRIMARY KEY,
      iata_code VARCHAR(3) NOT NULL,
      icao_code VARCHAR(4) NOT NULL,
      name VARCHAR(100) NOT NULL,
      time_zone VARCHAR(50) NOT NULL,
      currency VARCHAR(10) NOT NULL,
      annual_pax INT NOT NULL,
      runways_count INT NOT NULL,
      terminals_count INT NOT NULL,
      stands_count INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cfg_kpi_definition (
      id VARCHAR(50) PRIMARY KEY,
      code VARCHAR(20) NOT NULL,
      name VARCHAR(150) NOT NULL,
      domain VARCHAR(100) NOT NULL,
      tier INT NOT NULL,
      polarity VARCHAR(30) NOT NULL,
      unit VARCHAR(20) NOT NULL,
      owner_function VARCHAR(100) NOT NULL,
      controllability VARCHAR(50) NOT NULL,
      standard VARCHAR(150) NOT NULL,
      formula_text TEXT NOT NULL,
      target_2025 NUMERIC NOT NULL,
      target_2026 NUMERIC NOT NULL,
      tolerance NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dim_airline (
      code VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      carrier_type VARCHAR(20) NOT NULL,
      home_base BOOLEAN NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dim_stand (
      stand_id VARCHAR(20) PRIMARY KEY,
      terminal VARCHAR(5) NOT NULL,
      is_contact BOOLEAN NOT NULL,
      pier VARCHAR(10) NOT NULL,
      max_aircraft VARCHAR(5) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_flight_movement (
      id SERIAL PRIMARY KEY,
      flight_number VARCHAR(15) NOT NULL,
      airline_code VARCHAR(10) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      movement_type VARCHAR(15) NOT NULL,
      origin_dest VARCHAR(5) NOT NULL,
      scheduled_time TIMESTAMP NOT NULL,
      actual_time TIMESTAMP NOT NULL,
      stand VARCHAR(10) NOT NULL,
      runway VARCHAR(10) NOT NULL,
      aircraft_type VARCHAR(10) NOT NULL,
      pax_count INT NOT NULL,
      bag_count INT NOT NULL,
      delay_minutes INT NOT NULL,
      delay_code VARCHAR(10),
      delay_category VARCHAR(50),
      delay_controllable VARCHAR(30) NOT NULL,
      status VARCHAR(20) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_queue_interval (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP NOT NULL,
      checkpoint VARCHAR(50) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      lanes_open INT NOT NULL,
      lanes_planned INT NOT NULL,
      wait_p50 INT NOT NULL,
      wait_p90 INT NOT NULL,
      pax_served INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_baggage_flight (
      id SERIAL PRIMARY KEY,
      flight_id INT NOT NULL,
      flight_number VARCHAR(15) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      first_bag_minutes INT NOT NULL,
      last_bag_minutes INT NOT NULL,
      total_bags INT NOT NULL,
      mishandled_bags INT NOT NULL,
      carousel VARCHAR(10) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_asset_day (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      asset_class VARCHAR(50) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      required_minutes INT NOT NULL,
      available_minutes INT NOT NULL,
      outage_minutes INT NOT NULL,
      failure_count INT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_kpi_value (
      id SERIAL PRIMARY KEY,
      kpi_id VARCHAR(50) NOT NULL,
      date_grain VARCHAR(10) NOT NULL,
      grain_date DATE NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      airline_code VARCHAR(10) NOT NULL,
      actual_value NUMERIC NOT NULL,
      target_value NUMERIC NOT NULL,
      numerator NUMERIC NOT NULL,
      denominator NUMERIC NOT NULL,
      status VARCHAR(15) NOT NULL,
      data_quality NUMERIC NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_action_item (
      id VARCHAR(50) PRIMARY KEY,
      kpi_id VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      owner VARCHAR(100) NOT NULL,
      department VARCHAR(100) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(30) NOT NULL,
      priority VARCHAR(20) NOT NULL,
      root_cause TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_concession_sales (
      id SERIAL PRIMARY KEY,
      outlet_id VARCHAR(30) NOT NULL,
      tenant_name VARCHAR(100) NOT NULL,
      stream VARCHAR(50) NOT NULL,
      sub_category VARCHAR(100) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      location_zone VARCHAR(100) NOT NULL,
      sqm_area NUMERIC NOT NULL,
      gross_sales NUMERIC NOT NULL,
      concession_fee NUMERIC NOT NULL,
      transaction_count INT NOT NULL,
      transacting_customers INT NOT NULL,
      total_footfall INT NOT NULL,
      average_transaction_value NUMERIC NOT NULL,
      sales_per_sqm NUMERIC NOT NULL,
      passenger_type VARCHAR(20) NOT NULL,
      passenger_profile VARCHAR(20) NOT NULL,
      average_dwell_minutes INT NOT NULL,
      period_timestamp TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fact_parking_sessions (
      id SERIAL PRIMARY KEY,
      ticket_id VARCHAR(30) NOT NULL,
      terminal VARCHAR(5) NOT NULL,
      zone_name VARCHAR(50) NOT NULL,
      vehicle_type VARCHAR(30) NOT NULL,
      entry_time TIMESTAMP NOT NULL,
      exit_time TIMESTAMP NOT NULL,
      duration_hours NUMERIC NOT NULL,
      revenue_amount NUMERIC NOT NULL,
      occupancy_status VARCHAR(20) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id VARCHAR(50) NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      action VARCHAR(50) NOT NULL,
      details TEXT NOT NULL
    );
  `);

  // Check if already seeded
  const countRes = await db.query<{ count: string | number }>('SELECT count(*) as count FROM cfg_airport_profile');
  const count = Number((countRes.rows[0] as any)?.count || 0);

  if (count === 0) {
    await seedInitialData(db);
  }
}

async function seedInitialData(db: PGlite): Promise<void> {
  // 1. Insert airport profile
  await db.query(`
    INSERT INTO cfg_airport_profile (iata_code, icao_code, name, time_zone, currency, annual_pax, runways_count, terminals_count, stands_count)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    AIRPORT_PROFILE.iataCode,
    AIRPORT_PROFILE.icaoCode,
    AIRPORT_PROFILE.name,
    AIRPORT_PROFILE.timeZone,
    AIRPORT_PROFILE.currency,
    AIRPORT_PROFILE.currentAnnualPax,
    2,
    2,
    AIRPORT_PROFILE.standsTotal
  ]);

  // 2. Insert KPI Definitions
  for (const kpi of KEY_KPIS) {
    await db.query(`
      INSERT INTO cfg_kpi_definition (id, code, name, domain, tier, polarity, unit, owner_function, controllability, standard, formula_text, target_2025, target_2026, tolerance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      kpi.id,
      kpi.code,
      kpi.name,
      kpi.domain,
      kpi.tier,
      kpi.polarity,
      kpi.unit,
      kpi.ownerFunction,
      kpi.controllability,
      kpi.standard,
      kpi.formulaText,
      kpi.target2025,
      kpi.target2026,
      kpi.tolerance
    ]);
  }

  // 3. Insert Airlines
  const airlines = [
    { code: '6E', name: 'IndiGo', type: 'LCC', home: true },
    { code: 'AI', name: 'Air India', type: 'FSC', home: true },
    { code: 'SG', name: 'SpiceJet', type: 'LCC', home: false },
    { code: 'QP', name: 'Akasa Air', type: 'LCC', home: false },
    { code: 'EK', name: 'Emirates', type: 'FSC', home: false },
    { code: 'SQ', name: 'Singapore Airlines', type: 'FSC', home: false },
    { code: 'LH', name: 'Lufthansa', type: 'FSC', home: false },
    { code: 'BA', name: 'British Airways', type: 'FSC', home: false }
  ];

  for (const a of airlines) {
    await db.query(`
      INSERT INTO dim_airline (code, name, carrier_type, home_base)
      VALUES ($1, $2, $3, $4)
    `, [a.code, a.name, a.type, a.home]);
  }

  // 4. Insert Stands
  for (let i = 1; i <= 64; i++) {
    const term = i <= 26 ? 'T1' : 'T2';
    await db.query(`
      INSERT INTO dim_stand (stand_id, terminal, is_contact, pier, max_aircraft)
      VALUES ($1, $2, true, $3, 'Code E')
    `, [`Stand-${i}`, term, `Pier-${Math.ceil(i / 16)}`]);
  }
  for (let i = 65; i <= 118; i++) {
    const term = i <= 80 ? 'T1' : 'T2';
    await db.query(`
      INSERT INTO dim_stand (stand_id, terminal, is_contact, false, pier, max_aircraft)
      VALUES ($1, $2, false, 'Remote', 'Code C')
    `, [`Stand-${i}`, term]);
  }

  // 5. Seed Core Flight Movements for 24 months + active operational flights
  // Generate realistic flight operations with bank structures at 06:00-09:00 and 18:00-22:00
  const originDests = ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'DXB', 'SIN', 'LHR', 'FRA'];
  const aircraftList = ['A320neo', 'A321neo', 'B737-8', 'B787-9', 'B777-300ER', 'ATR72'];

  const now = new Date();
  const baseTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);

  // Generate 250 active / today flights for high-fidelity Live Ops radar & Gantt
  for (let i = 1; i <= 250; i++) {
    const airline = airlines[i % airlines.length];
    const isT1 = airline.type === 'LCC' && i % 3 !== 0;
    const term = isT1 ? 'T1' : 'T2';
    const isArr = i % 2 === 0;
    const fltNum = `${airline.code}-${100 + i}`;
    const od = originDests[i % originDests.length];
    const standNum = (i % 64) + 1;
    const stand = `Stand-${standNum}`;
    const runway = i % 2 === 0 ? '09L/27R' : '09R/27L';
    const ac = aircraftList[i % aircraftList.length];

    const schedMinutes = Math.floor((i * 4.5)) % 1320;
    const sched = new Date(baseTimestamp.getTime() + schedMinutes * 60000);

    // Realistic delay injection (85% on-time, 15% delayed with causes)
    let delay = 0;
    let delayCode: string | null = null;
    let delayCategory: string | null = null;
    let delayControllable = 'None';
    let status = 'On Time';

    if (i % 7 === 0) {
      delay = 18 + (i % 45);
      delayCode = '89';
      delayCategory = 'Airport Infrastructure & Gate Congestion';
      delayControllable = 'Airport';
      status = 'Delayed';
    } else if (i % 11 === 0) {
      delay = 25 + (i % 35);
      delayCode = '41';
      delayCategory = 'Airline Cabin Cleaning & Boarding';
      delayControllable = 'Airline';
      status = 'Delayed';
    } else if (i % 19 === 0) {
      delay = 40 + (i % 50);
      delayCode = '71';
      delayCategory = 'Air Traffic Control Flow En-Route';
      delayControllable = 'ATC';
      status = 'Delayed';
    }

    const actual = new Date(sched.getTime() + delay * 60000);
    const pax = 140 + (i % 60);
    const bags = Math.floor(pax * 1.15);

    await db.query(`
      INSERT INTO fact_flight_movement (
        flight_number, airline_code, terminal, movement_type, origin_dest,
        scheduled_time, actual_time, stand, runway, aircraft_type,
        pax_count, bag_count, delay_minutes, delay_code, delay_category,
        delay_controllable, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      fltNum, airline.code, term, isArr ? 'Arrival' : 'Departure', od,
      sched.toISOString(), actual.toISOString(), stand, runway, ac,
      pax, bags, delay, delayCode, delayCategory, delayControllable, status
    ]);

    // Insert Baggage Flight handling record
    if (isArr) {
      const firstBag = 10 + (delay > 0 ? (i % 8) : 2);
      const lastBag = firstBag + 14 + (i % 10);
      const mishandled = i % 25 === 0 ? 2 : (i % 60 === 0 ? 1 : 0);
      await db.query(`
        INSERT INTO fact_baggage_flight (
          flight_id, flight_number, terminal, first_bag_minutes, last_bag_minutes, total_bags, mishandled_bags, carousel
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [i, fltNum, term, firstBag, lastBag, bags, mishandled, `Belt-${(i % 12) + 1}`]);
    }
  }

  // 6. Seed Queue Intervals for terminals T1 and T2
  for (let hour = 5; hour <= 23; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const qTime = new Date(baseTimestamp.getFullYear(), baseTimestamp.getMonth(), baseTimestamp.getDate(), hour, minute, 0);
      const isPeak = (hour >= 6 && hour <= 9) || (hour >= 18 && hour <= 21);
      
      // T1 Checkpoint
      await db.query(`
        INSERT INTO fact_queue_interval (timestamp, checkpoint, terminal, lanes_open, lanes_planned, wait_p50, wait_p90, pax_served)
        VALUES ($1, 'Security Checkpoint Alpha', 'T1', $2, $3, $4, $5, $6)
      `, [
        qTime.toISOString(),
        isPeak ? 16 : 10,
        isPeak ? 18 : 10,
        isPeak ? 7 : 4,
        isPeak ? 11 : 6,
        isPeak ? 380 : 190
      ]);

      // T2 Checkpoint
      await db.query(`
        INSERT INTO fact_queue_interval (timestamp, checkpoint, terminal, lanes_open, lanes_planned, wait_p50, wait_p90, pax_served)
        VALUES ($1, 'Central Security screening', 'T2', $2, $3, $4, $5, $6)
      `, [
        qTime.toISOString(),
        isPeak ? 26 : 16,
        isPeak ? 28 : 16,
        isPeak ? 6 : 3,
        isPeak ? 9 : 5,
        isPeak ? 540 : 260
      ]);
    }
  }

  // 7. Seed Corrective Actions
  const actions = [
    {
      id: 'ACT-2026-001',
      kpiId: 'kpi-pun-01',
      title: 'T1 Remote Stand Bus Boarding Dispatch Bottleneck Rectification',
      owner: 'Dinesh Kumar',
      department: 'Operations Control',
      dueDate: '2026-11-15',
      status: 'In Progress',
      priority: 'High',
      rootCause: 'Apron passenger coach driver handover delays during 07:30 peak bank.'
    },
    {
      id: 'ACT-2026-002',
      kpiId: 'kpi-pax-01',
      title: 'T2 International Tray Return Sorter Optical Sensor Calibration',
      owner: 'Col. Sanjeev Menon',
      department: 'Security',
      dueDate: '2026-10-30',
      status: 'Open',
      priority: 'High',
      rootCause: 'Optical misalignment causing tray jam on Lane 4 and Lane 7.'
    },
    {
      id: 'ACT-2026-003',
      kpiId: 'kpi-ast-01',
      title: 'Aerobridge 14 Hydraulic Pressure Seal Scheduled Overhaul',
      owner: 'Pradeep Joshi',
      department: 'Engineering & Maintenance',
      dueDate: '2026-10-25',
      status: 'Closed',
      priority: 'Medium',
      rootCause: 'Minor hydraulic weeping identified during weekly thermal imaging audit.'
    },
    {
      id: 'ACT-2026-004',
      kpiId: 'kpi-bag-01',
      title: 'T2 Inbound Belt 6 Baggage Offload Tug Route Streamlining',
      owner: 'Vikram Malhotra',
      department: 'Baggage Operations',
      dueDate: '2026-11-02',
      status: 'In Progress',
      priority: 'Medium',
      rootCause: 'Tug driver route collision avoidance slow down near stand 32.'
    }
  ];

  for (const act of actions) {
    await db.query(`
      INSERT INTO fact_action_item (id, kpi_id, title, owner, department, due_date, status, priority, root_cause)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [act.id, act.kpiId, act.title, act.owner, act.department, act.dueDate, act.status, act.priority, act.rootCause]);
  }

  // 8. Seed Concession Outlets and Sales Transactions
  const concessions = [
    {
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
      averageDwellMinutes: 78
    },
    {
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
      averageDwellMinutes: 42
    },
    {
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
      averageDwellMinutes: 65
    },
    {
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
      averageDwellMinutes: 52
    },
    {
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
      averageDwellMinutes: 58
    },
    {
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
      averageDwellMinutes: 38
    },
    {
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
      averageDwellMinutes: 32
    },
    {
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
      averageDwellMinutes: 48
    },
    {
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
      averageDwellMinutes: 120
    }
  ];

  for (const c of concessions) {
    await db.query(`
      INSERT INTO fact_concession_sales (
        outlet_id, tenant_name, stream, sub_category, terminal, location_zone,
        sqm_area, gross_sales, concession_fee, transaction_count, transacting_customers,
        total_footfall, average_transaction_value, sales_per_sqm, passenger_type,
        passenger_profile, average_dwell_minutes, period_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `, [
      c.outletId, c.tenantName, c.stream, c.subCategory, c.terminal, c.locationZone,
      c.sqmArea, c.grossSales, c.concessionFee, c.transactionCount, c.transactingCustomers,
      c.totalFootfall, c.averageTransactionValue, c.salesPerSqm, c.passengerType,
      c.passengerProfile, c.averageDwellMinutes, baseTimestamp.toISOString()
    ]);
  }

  // 9. Seed Parking Sessions
  const parkingZones = [
    { zone: 'Short-Term Premium' as const, term: 'T1' as const, vtype: 'Private Car' as const, dur: 2.2, rev: 220, stat: 'Completed' as const },
    { zone: 'Short-Term Premium' as const, term: 'T2' as const, vtype: 'Private Car' as const, dur: 3.1, rev: 330, stat: 'Occupied' as const },
    { zone: 'Multi-Day Long Term' as const, term: 'T1' as const, vtype: 'Private Car' as const, dur: 74.0, rev: 1850, stat: 'Completed' as const },
    { zone: 'Multi-Day Long Term' as const, term: 'T2' as const, vtype: 'Private Car' as const, dur: 96.0, rev: 2400, stat: 'Occupied' as const },
    { zone: 'Valet Terminal' as const, term: 'T2' as const, vtype: 'Private Car' as const, dur: 4.5, rev: 650, stat: 'Completed' as const },
    { zone: 'Commercial Taxi Staging' as const, term: 'T1' as const, vtype: 'Commercial Taxi' as const, dur: 0.9, rev: 90, stat: 'Completed' as const },
    { zone: 'Commercial Taxi Staging' as const, term: 'T2' as const, vtype: 'Commercial Taxi' as const, dur: 1.1, rev: 110, stat: 'Occupied' as const }
  ];

  for (let pIdx = 0; pIdx < parkingZones.length; pIdx++) {
    const pz = parkingZones[pIdx];
    await db.query(`
      INSERT INTO fact_parking_sessions (
        ticket_id, terminal, zone_name, vehicle_type, entry_time, exit_time,
        duration_hours, revenue_amount, occupancy_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      `PKT-2026-${1000 + pIdx}`,
      pz.term,
      pz.zone,
      pz.vtype,
      new Date(baseTimestamp.getTime() - pz.dur * 3600000).toISOString(),
      baseTimestamp.toISOString(),
      pz.dur,
      pz.rev,
      pz.stat
    ]);
  }

  // 10. Audit log initial entry
  await db.query(`
    INSERT INTO audit_log (user_id, user_name, action, details)
    VALUES ('system', 'AIONOS System Kernel', 'INITIAL_BOOT', 'Initialized PostgreSQL WASM database with 28 conformed dimensions and AIONOS ZZA 624-KPI library.')
  `);
}
