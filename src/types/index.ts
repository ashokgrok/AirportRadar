export type SensitivityLevel = 'Public' | 'Internal' | 'Restricted';
export type MetricPolarity = 'Higher is Better' | 'Lower is Better' | 'Within Band' | 'Monitor Only';
export type RagStatus = 'green' | 'amber' | 'red' | 'monitor';

export interface UserRole {
  id: string;
  name: string;
  department: string;
  homeDashboardId: string;
  scopeType: 'all' | 'terminal' | 'airline' | 'handler' | 'tenant' | 'asset_class' | 'programme';
  scopeValue?: string;
  permissions: string[];
  canViewUnmaskedPii: boolean;
  canViewTenantRevenue: boolean;
  canEditTargets: 'none' | 'propose' | 'edit' | 'approve';
  canEditDefinitions: 'none' | 'propose' | 'edit';
}

export interface KpiDefinition {
  id: string;
  code: string;
  name: string;
  domain: string;
  subdomain: string;
  tier: 1 | 2 | 3;
  polarity: MetricPolarity;
  unit: string;
  frequency: string;
  ownerFunction: string;
  controllability: 'Airport Direct' | 'Shared Operational' | 'Airline' | 'ATC / External';
  standard: string;
  aiOpportunity: string;
  sensitivity: SensitivityLevel;
  formulaText: string;
  numeratorDesc: string;
  denominatorDesc: string;
  target2025: number;
  target2026: number;
  tolerance: number; // e.g. 0.05 for 5%
  benchmarkPeer?: number;
  dataQualityScore: number;
}

export interface KpiValueResult {
  kpiId: string;
  name: string;
  code: string;
  domain: string;
  tier: 1 | 2 | 3;
  unit: string;
  polarity: MetricPolarity;
  currentValue: number;
  target: number;
  previousValue: number;
  numerator: number;
  denominator: number;
  changePct: number;
  status: RagStatus;
  trend: number[]; // 13-period sparkline
  dataQuality: number;
  controllability: string;
  airportControllableDelay?: number;
  formula: string;
  owner: string;
  standard: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  worstDate: string;
  description: string;
  impactSummary: string;
  affectedDomains: string[];
  kpisToHighlight: string[];
}

export interface DashboardMeta {
  id: string;
  name: string;
  category: string;
  primaryRole: string;
  refreshRate: string;
  coreQuestion: string;
  signatureVisual: string;
  iconName: string;
}

export interface GlobalFilterState {
  dateRange: 'today' | '7d' | '30d' | '90d' | '24m' | 'custom';
  startDate?: string;
  endDate?: string;
  terminal: 'ALL' | 'T1' | 'T2';
  airline: string; // 'ALL' or airline code
  comparisonPeriod: 'prior_period' | 'prior_year' | 'target' | 'budget';
  flightType: 'ALL' | 'Domestic' | 'International';
}

export interface ActionItem {
  id: string;
  kpiId: string;
  title: string;
  owner: string;
  department: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Under Review' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  rootCause: string;
}

export interface FlightRecord {
  id: number;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  originDest: string;
  movementType: 'Arrival' | 'Departure';
  scheduledTime: string;
  actualTime: string;
  terminal: string;
  stand: string;
  runway: string;
  aircraftType: string;
  paxCount: number;
  bagCount: number;
  delayMinutes: number;
  delayCode: string;
  delayCategory: string;
  delayControllable: 'Airport' | 'Airline' | 'ATC' | 'Weather';
  status: 'On Time' | 'Delayed' | 'Departed' | 'Arrived' | 'Cancelled';
}

export interface QueueRecord {
  id: number;
  timestamp: string;
  checkpoint: string;
  terminal: string;
  lanesOpen: number;
  lanesPlanned: number;
  waitMinutesP50: number;
  waitMinutesP90: number;
  paxProcessed: number;
}

export interface TargetProposal {
  id: string;
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  currentValue: number;
  currentTarget: number;
  proposedTarget: number;
  unit: string;
  proposerId: string;
  proposerName: string;
  department: string;
  justification: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface KpiComment {
  id: string;
  kpiId: string;
  kpiCode: string;
  periodIndex: number; // 0-12 matching sparkline index
  periodLabel: string;
  author: string;
  department: string;
  text: string;
  createdAt: string;
}

export interface OperationalEvent {
  id: string;
  timestamp: string;
  category: 'flight' | 'stand' | 'queue' | 'baggage' | 'safety' | 'cyber';
  message: string;
  severity: 'nominal' | 'warning' | 'critical';
  details?: string;
}

export interface NamedView {
  id: string;
  name: string;
  pinnedKpiCodes: string[];
  hiddenKpiCodes: string[];
  dashboardId: string;
}

export type CommercialStreamType = 
  | 'Retail & Duty-Free' 
  | 'Food & Beverage' 
  | 'Parking & Ground Transportation' 
  | 'Advertising & Media' 
  | 'Property & Real Estate';

export interface CommercialConcessionRecord {
  id: number;
  outletId: string;
  tenantName: string;
  stream: CommercialStreamType;
  subCategory: string; // 'Duty Free Liquor/Tobacco', 'Luxury Fashion', 'Grab & Go Cafe', 'Casual Dining', 'Short-Term Parking', 'Digital Billboards', 'Cargo Warehouse Lease'
  terminal: 'T1' | 'T2';
  locationZone: string; // 'Airside Departure Pier Alpha', 'Central Duty Free Plaza', 'Landside Forecourt', 'Airside Food Court'
  sqmArea: number;
  grossSales: number; // in INR
  concessionFee: number; // in INR (royalty/MAG)
  transactionCount: number;
  transactingCustomers: number;
  totalFootfall: number;
  averageTransactionValue: number;
  salesPerSqm: number;
  passengerType: 'International' | 'Domestic';
  passengerProfile: 'Business' | 'Leisure';
  averageDwellMinutes: number;
  periodTimestamp: string;
}

export interface ParkingSessionRecord {
  id: number;
  ticketId: string;
  terminal: 'T1' | 'T2';
  zoneName: 'Short-Term Premium' | 'Multi-Day Long Term' | 'Valet Terminal' | 'Commercial Taxi Staging';
  vehicleType: 'Private Car' | 'Commercial Taxi' | 'Bus/Coach' | 'Two-Wheeler';
  entryTime: string;
  exitTime: string;
  durationHours: number;
  revenueAmount: number;
  occupancyStatus: 'Occupied' | 'Completed';
}

export interface CommercialDrivingVariables {
  trafficMix: {
    internationalPaxShare: number; // %
    domesticPaxShare: number; // %
    internationalSpendPerPax: number; // ₹
    domesticSpendPerPax: number; // ₹
    internationalPenetrationRate: number; // %
    domesticPenetrationRate: number; // %
  };
  passengerProfile: {
    businessShare: number; // %
    leisureShare: number; // %
    businessAvgDwellMin: number;
    leisureAvgDwellMin: number;
    businessAtv: number; // ₹
    leisureAtv: number; // ₹
  };
  dwellTimeElasticity: {
    under30MinSpend: number;
    min30To60Spend: number;
    min60To90Spend: number;
    over90MinSpend: number;
  };
}


