// Source: SIH 2025 Grand Finale result table supplied in the JGI-SIH Master Documentation.
// These are SOURCE RECORDS (PS ID, category, organization, department, team + idea IDs,
// team name and team-lead text). The source does NOT contain full problem-statement
// descriptions, so none are invented here.
//
// The repository is intentionally data-driven: replace RAW_RECORDS (or feed rows from a
// future CSV/JSON import) without touching any UI component.

export interface PsRecord {
  sno: number;
  psId: string;
  category: "Software" | "Hardware";
  organization: string;
  department: string;
  teamId: string;
  ideaId: string;
  teamName: string;
  teamLead: string;
}

export const PS_DATASET_LABEL = "SIH 2025 Grand Finale — supplied source records";
export const PS_DATASET_NOTE =
  "Metadata reproduced exactly from the supplied attachment. Full problem-statement descriptions are not part of the source data.";

export const PS_RECORDS: PsRecord[] = [
  { sno: 1, psId: "SIH25001", category: "Software", organization: "Ministry of Development of North Eastern Region (MoDoNER)", department: "Ministry of Health & Family Welfare/Ministry of Jal Shakti (in collaboration with State Health Departments and PHEDs)", teamId: "52360", ideaId: "59902", teamName: "CORE_401", teamLead: "Shubh S" },
  { sno: 2, psId: "SIH25002", category: "Software", organization: "Ministry of Development of North Eastern Region (MoDoNER)", department: "Ministry of Tourism/ Ministry of Home Affairs (in collaboration with State Police Departments and NIC)", teamId: "69738", ideaId: "62995", teamName: "ITerativebytes", teamLead: "Saniyaa" },
  { sno: 3, psId: "SIH25003", category: "Hardware", organization: "Ministry of Development of North Eastern Region (MoDoNER)", department: "Ministry of Rural Development/ Ministry of Environment, Forest and Climate Change / Ministry of Road Transport and Highways", teamId: "90940", ideaId: "89004", teamName: "TheSixthSense", teamLead: "Vatsal S" },
  { sno: 4, psId: "SIH25004", category: "Software", organization: "Ministry of Fisheries, Animal Husbandry & Dairying", department: "Department of Animal Husbandry & Dairying (DoAH&D)", teamId: "99556", ideaId: "95429", teamName: "A-6", teamLead: "Bhagira" },
  { sno: 5, psId: "SIH25005", category: "Software", organization: "Ministry of Fisheries, Animal Husbandry & Dairying", department: "Department of Animal Husbandry & Dairying (DoAH&D)", teamId: "99919", ideaId: "95480", teamName: "SkyNRG", teamLead: "Nancy Srivasta" },
  { sno: 6, psId: "SIH25006", category: "Software", organization: "Ministry of Fisheries, Animal Husbandry & Dairying", department: "Department of Animal Husbandry & Dairying (DoAH&D)", teamId: "73204", ideaId: "116838", teamName: "Linear_Depression", teamLead: "Vedica M" },
  { sno: 7, psId: "SIH25007", category: "Software", organization: "Ministry of Fisheries, Animal Husbandry & Dairying", department: "Department of Animal Husbandry & Dairying (DoAH&D)", teamId: "93240", ideaId: "112150", teamName: "Cattle-Coders", teamLead: "Bhavya Singh" },
  { sno: 8, psId: "SIH25008", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "82313", ideaId: "78539", teamName: "VisionHackers", teamLead: "Madhur Manges Navele" },
  { sno: 9, psId: "SIH25009", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "73186", ideaId: "71040", teamName: "TechPravaha", teamLead: "Rushi B" },
  { sno: 10, psId: "SIH25010", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "68843", ideaId: "74435", teamName: "NEXAURA2.3", teamLead: "Udaya M" },
  { sno: 11, psId: "SIH25011", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "73046", ideaId: "66415", teamName: "Phantom", teamLead: "Techies Krishna Kumar" },
  { sno: 12, psId: "SIH25012", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "78224", ideaId: "80985", teamName: "COGNISPHERE", teamLead: "PASUPU VAMSI K" },
  { sno: 13, psId: "SIH25013", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "52552", ideaId: "58687", teamName: "NextStop", teamLead: "Tanish G" },
  { sno: 14, psId: "SIH25014", category: "Hardware", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "86656", ideaId: "70258", teamName: "BIT", teamLead: "IGNITERS Soumya" },
  { sno: 15, psId: "SIH25014", category: "Hardware", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "97988", ideaId: "87986", teamName: "SWACH", teamLead: "Ayushya Rajkum Maurya" },
  { sno: 16, psId: "SIH25015", category: "Hardware", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "74950", ideaId: "88832", teamName: "Iconic", teamLead: "Forcee Dinesh" },
  { sno: 17, psId: "SIH25016", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "56123", ideaId: "75328", teamName: "ToinCoss", teamLead: "Aryan S" },
  { sno: 18, psId: "SIH25017", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "69110", ideaId: "74120", teamName: "Trinetra_", teamLead: "Lokhand Nisarga" },
  { sno: 19, psId: "SIH25018", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "52789", ideaId: "64404", teamName: "MedXCoders", teamLead: "Tharun Jothiling" },
  { sno: 20, psId: "SIH25018", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "50525", ideaId: "70675", teamName: "Git-ignite", teamLead: "Om Ran Singh" },
  { sno: 21, psId: "SIH25019", category: "Software", organization: "Government of Punjab", department: "Department of Higher Education", teamId: "58851", ideaId: "59898", teamName: "De-buggers", teamLead: "Rishi" },
  { sno: 22, psId: "SIH25020", category: "Hardware", organization: "Ministry of", department: "Railways Ministry of Railways", teamId: "68737", ideaId: "102104", teamName: "Team", teamLead: "Shers Atharva" },
  { sno: 23, psId: "SIH25021", category: "Hardware", organization: "Ministry of", department: "Railways Ministry of Railways", teamId: "84057", ideaId: "113801", teamName: "Code", teamLead: "on Track1 Daksh R" },
  { sno: 24, psId: "SIH25022", category: "Software", organization: "Ministry of", department: "Railways Ministry of Railways", teamId: "66575", ideaId: "61652", teamName: "nyx", teamLead: "Mihir M Phalke" },
  { sno: 25, psId: "SIH25023", category: "Software", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "53111", ideaId: "58835", teamName: "PanchPlus", teamLead: "Abhishe Mandag" },
  { sno: 26, psId: "SIH25024", category: "Software", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "55589", ideaId: "73044", teamName: "LexCorps", teamLead: "Satyam" },
  { sno: 27, psId: "SIH25025", category: "Hardware", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "60129", ideaId: "93249", teamName: "Hyper", teamLead: "Grey Pulkit K" },
  { sno: 28, psId: "SIH25025", category: "Hardware", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "91965", ideaId: "111529", teamName: "KRENOVIANTZ", teamLead: "Lalith R" },
  { sno: 29, psId: "SIH25026", category: "Software", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "101029", ideaId: "118704", teamName: "Passsengers", teamLead: "Moham Azeem" },
  { sno: 30, psId: "SIH25026", category: "Software", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "102718", ideaId: "120175", teamName: "CodeVaidyas_VIT", teamLead: "PAUL AY BARUN" },
  { sno: 31, psId: "SIH25027", category: "Software", organization: "Ministry of Ayush", department: "All India Institute of Ayurveda (AIIA)", teamId: "72423", ideaId: "104597", teamName: "Knights", teamLead: "Kunal K" },
  { sno: 32, psId: "SIH25028", category: "Software", organization: "Government of Jharkhand", department: "Department of Higher and Technical Education", teamId: "88322", ideaId: "78114", teamName: "CAFFEIN", teamLead: "OVERFLOW Sanjeev Kumar" },
  { sno: 33, psId: "SIH25029", category: "Software", organization: "Government of Jharkhand", department: "Department of Higher and Technical Education", teamId: "85508", ideaId: "78194", teamName: "Navomesh", teamLead: "Amarty" },
  { sno: 34, psId: "SIH25030", category: "Software", organization: "Government of Jharkhand", department: "Department of Higher and Technical Education", teamId: "57801", ideaId: "63829", teamName: "AGRO", teamLead: "NOVA. Keshav" },
  { sno: 35, psId: "SIH25031", category: "Software", organization: "Government of Jharkhand", department: "Department of Higher and Technical Education", teamId: "64560", ideaId: "62573", teamName: "Visioneers_25", teamLead: "Jayarag" },
  { sno: 36, psId: "SIH25032", category: "Software", organization: "Government of Jharkhand", department: "Department of Higher and Technical Education", teamId: "76239", ideaId: "73353", teamName: "Bit-Storm", teamLead: "Niket Th" },
  { sno: 37, psId: "SIH25033", category: "Software", organization: "Ministry of Corporate Affairs", department: "Ministry of Corporate Affairs (MoCA)", teamId: "79844", ideaId: "95329", teamName: "INNOV_01", teamLead: "Yash Bu" },
  { sno: 38, psId: "SIH25034", category: "Software", organization: "Ministry of Corporate Affairs", department: "Ministry of Corporate Affairs (MoCA)", teamId: "57770", ideaId: "88269", teamName: "Matrix_GTBIT", teamLead: "Manvi J" },
  { sno: 39, psId: "SIH25035", category: "Software", organization: "Ministry of Corporate Affairs", department: "Ministry of Corporate Affairs (MoCA)", teamId: "65901", ideaId: "119759", teamName: "NLPNINJAS", teamLead: "KRISHN KOPPOL" },
  { sno: 40, psId: "SIH25036", category: "Hardware", organization: "Ministry of Earth Sciences (MoES)", department: "Ministry of Earth Sciences (MoES)", teamId: "50699", ideaId: "94506", teamName: "TESSERACT", teamLead: "A.LEO LAZAAR" },
  { sno: 41, psId: "SIH25037", category: "Hardware", organization: "Ministry of Earth Sciences (MoES)", department: "National Centre for Coastal Research (NCCR)", teamId: "84310", ideaId: "130015", teamName: "The_Caffeine_Clause", teamLead: "Yash Sh" },
  { sno: 42, psId: "SIH25038", category: "Software", organization: "Ministry of Earth Sciences (MoES)", department: "National Centre for Coastal Research (NCCR)", teamId: "67614", ideaId: "85372", teamName: "Pixel-Minds", teamLead: "Ansari F Ahmed Ahemed" },
  { sno: 43, psId: "SIH25039", category: "Software", organization: "Ministry of Earth Sciences (MoES)", department: "Indian National Centre for Ocean Information Services (INCOIS)", teamId: "55607", ideaId: "92123", teamName: "7MOD3", teamLead: "Suryans Singh" },
  { sno: 44, psId: "SIH25040", category: "Software", organization: "Ministry of Earth Sciences (MoES)", department: "Indian National Centre for Ocean Information Services (INCOIS)", teamId: "85265", ideaId: "69443", teamName: "Paarth", teamLead: "Simran" },
  { sno: 45, psId: "SIH25041", category: "Software", organization: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", department: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", teamId: "62053", ideaId: "88844", teamName: "TechnicalMavde", teamLead: "Prasann" },
  { sno: 46, psId: "SIH25042", category: "Software", organization: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", department: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", teamId: "77056", ideaId: "71441", teamName: "Storm", teamLead: "Surge Anish S" },
  { sno: 47, psId: "SIH25043", category: "Hardware", organization: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", department: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", teamId: "84553", ideaId: "130378", teamName: "Visionary", teamLead: "Vanguards Chris Ro" },
  { sno: 48, psId: "SIH25043", category: "Hardware", organization: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", department: "Ministry of Earth Sciences (MoES) Centre for Marine Living Resources and Ecology (CMLRE)", teamId: "87961", ideaId: "117243", teamName: "RoboRebels", teamLead: "Diksha S" },
  { sno: 49, psId: "SIH25044", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "74376", ideaId: "88165", teamName: "HtwoO", teamLead: "Ghauth" },
  { sno: 50, psId: "SIH25045", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "97135", ideaId: "102150", teamName: "HackLords", teamLead: "Lakshya" },
  { sno: 51, psId: "SIH25046", category: "Hardware", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "102994", ideaId: "100157", teamName: "ONLY", teamLead: "BRAINS JEEVAN S" },
  { sno: 52, psId: "SIH25047", category: "Hardware", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "70161", ideaId: "84266", teamName: "Astra", teamLead: "2.0 Avi Mitt" },
  { sno: 53, psId: "SIH25047", category: "Hardware", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "74910", ideaId: "102045", teamName: "Aero", teamLead: "Rescue Naresh" },
  { sno: 54, psId: "SIH25048", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "53919", ideaId: "67164", teamName: "INNOSPHERES", teamLead: "V. AKSH REDDY" },
  { sno: 55, psId: "SIH25049", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "57640", ideaId: "60125", teamName: "Swasthya", teamLead: "Sahayak Vikrant" },
  { sno: 56, psId: "SIH25050", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "76637", ideaId: "74622", teamName: "Dynamo1", teamLead: "Jashanp Kaur" },
  { sno: 57, psId: "SIH25051", category: "Hardware", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "78438", ideaId: "86485", teamName: "Status200_DIEMS_CSE", teamLead: "ATHARV PRASHA CHAVAN" },
  { sno: 58, psId: "SIH25051", category: "Hardware", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "57123", ideaId: "111256", teamName: "Ctrl@Freaks", teamLead: "Dhanvin" },
  { sno: 59, psId: "SIH25052", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "64261", ideaId: "65346", teamName: "CulturaX", teamLead: "Ishwari Ganpat Shinde" },
  { sno: 60, psId: "SIH25052", category: "Software", organization: "Government of Odisha", department: "Electronics & IT Department", teamId: "79554", ideaId: "85886", teamName: "Augmentors", teamLead: "Creators Suryaka Mahant" },
  { sno: 61, psId: "SIH25053", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "Department of Consumer Affairs (DoCA)", teamId: "114391", ideaId: "116556", teamName: "TeamGroundZero", teamLead: "Prajwal Joshi" },
  { sno: 62, psId: "SIH25054", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "National Test House,Department of Consumer Affairs", teamId: "64075", ideaId: "61897", teamName: "Watt", teamLead: "the Hack Sadgi Si" },
  { sno: 63, psId: "SIH25055", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "National Test House,Department of Consumer Affairs", teamId: "55636", ideaId: "118191", teamName: "Team", teamLead: "Velocis Deven K Mane" },
  { sno: 64, psId: "SIH25057", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "Department of Consumer Affairs (DoCA)", teamId: "68499", ideaId: "105738", teamName: "KRISHINETRA", teamLead: "Kriten S" },
  { sno: 65, psId: "SIH25057", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "Department of Consumer Affairs (DoCA)", teamId: "64229", ideaId: "118301", teamName: "Code", teamLead: "Nirvana Srinjoy" },
  { sno: 66, psId: "SIH25058", category: "Hardware", organization: "Ministry of Consumer Affairs, Food & Public Distribution (MoCA,F&PD)", department: "Department of Consumer Affairs (DoCA)", teamId: "56711", ideaId: "70092", teamName: "The", teamLead: "Qubits Mihir Ja" },
  { sno: 67, psId: "SIH25059", category: "Software", organization: "Ministry of Social Justice & Empowerment (MoSJE)", department: "Department of Social Justice & Empowerment (DoSJE)", teamId: "72483", ideaId: "91080", teamName: "Data_CodeBlitz", teamLead: "Suyash" },
  { sno: 68, psId: "SIH25060", category: "Software", organization: "Ministry of Social Justice & Empowerment (MoSJE)", department: "Department of Social Justice & Empowerment (DoSJE)", teamId: "64650", ideaId: "64629", teamName: "Si", teamLead: "Extractors Sabarish" },
  { sno: 69, psId: "SIH25061", category: "Software", organization: "Government of Sikkim", department: "Department of Higher & Technical Education", teamId: "50617", ideaId: "104334", teamName: "Promatrs", teamLead: "Meheer" },
  { sno: 70, psId: "SIH25062", category: "Hardware", organization: "Government of Sikkim", department: "Department of Higher & Technical Education", teamId: "74074", ideaId: "105595", teamName: "The", teamLead: "Thinktronics Abhishe Chauha" },
  { sno: 71, psId: "SIH25063", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "71222", ideaId: "75501", teamName: "Circuit", teamLead: "Sentinels-Tharun" },
  { sno: 72, psId: "SIH25063", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "62585", ideaId: "90794", teamName: "818_DHRUVA", teamLead: "Ridha K" },
  { sno: 73, psId: "SIH25064", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "74672", ideaId: "110034", teamName: "ECO", teamLead: "GRID INNOVATORS PUNNA KRISHN" },
  { sno: 74, psId: "SIH25064", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "70380", ideaId: "119584", teamName: "TEAM_INNOVENTORS", teamLead: "Utkarsh" },
  { sno: 75, psId: "SIH25065", category: "Software", organization: "Ministry of Jal Shakti (MoJS)", department: "Central Ground Water Board (CGWB)", teamId: "94336", ideaId: "88438", teamName: "#Team", teamLead: "KIS Ansh Va" },
  { sno: 76, psId: "SIH25066", category: "Software", organization: "Ministry of Jal Shakti (MoJS)", department: "Central Ground Water Board (CGWB)", teamId: "102633", ideaId: "118742", teamName: "_Mercury_", teamLead: "Harsh K" },
  { sno: 77, psId: "SIH25067", category: "Software", organization: "Ministry of Jal Shakti (MoJS)", department: "Central Ground Water Board (CGWB)", teamId: "91362", ideaId: "117260", teamName: "GritForce", teamLead: "Kandhu Rasagna" },
  { sno: 78, psId: "SIH25068", category: "Software", organization: "Ministry of Jal Shakti (MoJS)", department: "Central Ground Water Board (CGWB)", teamId: "64893", ideaId: "106377", teamName: "NovaSix_25", teamLead: "HANSIK" },
  { sno: 79, psId: "SIH25069", category: "Software", organization: "Ministry of Mines Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)", department: "Ministry of Mines Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)", teamId: "61657", ideaId: "66055", teamName: "AXEFORTUNE", teamLead: "MUKES M" },
  { sno: 80, psId: "SIH25070", category: "Software", organization: "Ministry of Mines Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)", department: "Ministry of Mines Jawaharlal Nehru Aluminium Research Development and Design Centre (JNARDDC)", teamId: "63081", ideaId: "66429", teamName: "GLITCH", teamLead: "CODERS(TGC) Mohana" },
  { sno: 81, psId: "SIH25071", category: "Software", organization: "Ministry of Mines", department: "National Institute of Rock Mechanics (NIRM)", teamId: "61779", ideaId: "118079", teamName: "Hackmonks06", teamLead: "Abhishe Dadasa Shelar" },
  { sno: 82, psId: "SIH25072", category: "Hardware", organization: "Ministry of Mines Hindustan Copper Limited (HCL)", department: "Ministry of Mines Hindustan Copper Limited (HCL)", teamId: "87480", ideaId: "88157", teamName: "Solar", teamLead: "Surfers Tumulu Shashan" },
  { sno: 83, psId: "SIH25072", category: "Hardware", organization: "Ministry of Mines Hindustan Copper Limited (HCL)", department: "Ministry of Mines Hindustan Copper Limited (HCL)", teamId: "83769", ideaId: "116312", teamName: "MECH-MINDS", teamLead: "Mathiya S" },
  { sno: 84, psId: "SIH25073", category: "Software", organization: "Ministry of Youth Affairs and Sports", department: "Sports Authority of India (SAI)", teamId: "100027", ideaId: "96388", teamName: "Antardrishti", teamLead: "Asmit B" },
  { sno: 85, psId: "SIH25074", category: "Software", organization: "Government of Kerala", department: "Department of Agriculture", teamId: "76145", ideaId: "81525", teamName: "Team", teamLead: "Blessed Nilesh K" },
  { sno: 86, psId: "SIH25075", category: "Software", organization: "Government of Kerala", department: "Department of Agriculture", teamId: "77877", ideaId: "68919", teamName: "InnoVeda_75", teamLead: "Himans Ghansh Kejdiwa" },
  { sno: 87, psId: "SIH25076", category: "Software", organization: "Government of Kerala", department: "Department of Agriculture", teamId: "90506", ideaId: "90224", teamName: "PLAN", teamLead: "B_ Himans Mishra" },
  { sno: 88, psId: "SIH25077", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "73960", ideaId: "67701", teamName: "MACGYVER", teamLead: "ABHIRA KUMAR" },
  { sno: 89, psId: "SIH25077", category: "Hardware", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "73736", ideaId: "93482", teamName: "Team", teamLead: "Jayastra YENNI JYOTHS" },
  { sno: 90, psId: "SIH25079", category: "Software", organization: "Government of Kerala", department: "Kerala State Electricity Board Limited (KSEBL)", teamId: "75015", ideaId: "95240", teamName: "INNOHACK", teamLead: "Bysani S Amruth" },
  { sno: 91, psId: "SIH25080", category: "Software", organization: "Government of Kerala Kochi Metro Rail Limited (KMRL)", department: "Government of Kerala Kochi Metro Rail Limited (KMRL)", teamId: "107500", ideaId: "110484", teamName: "Team_Rocket_", teamLead: "Ipshita T" },
  { sno: 92, psId: "SIH25081", category: "Software", organization: "Government of Kerala Kochi Metro Rail Limited (KMRL)", department: "Government of Kerala Kochi Metro Rail Limited (KMRL)", teamId: "95486", ideaId: "92088", teamName: "Stellar", teamLead: "Suhaan Agarwa" },
  { sno: 93, psId: "SIH25082", category: "Software", organization: "Government of Kerala", department: "KSCSTE-NATIONAL TRANSPORTATION PLANNING AND RESEARCH CENTRE (NATPAC)", teamId: "68616", ideaId: "74290", teamName: "YUKTEK", teamLead: "Tanvee" },
  { sno: 94, psId: "SIH25083", category: "Software", organization: "Government of Kerala", department: "HEALTH SERVICE DEPARTMENT", teamId: "59096", ideaId: "83668", teamName: "Uday", teamLead: "Nishant" },
  { sno: 95, psId: "SIH25084", category: "Hardware", organization: "Government of Kerala", department: "HEALTH SERVICE DEPARTMENT", teamId: "81439", ideaId: "118934", teamName: "Team", teamLead: "Nephron Aaryan Singh B" },
  { sno: 96, psId: "SIH25084", category: "Hardware", organization: "Government of Kerala", department: "HEALTH SERVICE DEPARTMENT", teamId: "107380", ideaId: "116228", teamName: "ArogyaShield", teamLead: "Vishwaj Krishnd" },
  { sno: 97, psId: "SIH25085", category: "Hardware", organization: "Government of Kerala KERALA RURAL WATER SUPPLY AND SANITATION AGENCY, WATER RESOURCES DEPARTMENT, GOVERNMENT OF KERALA", department: "Government of Kerala KERALA RURAL WATER SUPPLY AND SANITATION AGENCY, WATER RESOURCES DEPARTMENT, GOVERNMENT OF KERALA", teamId: "78248", ideaId: "94043", teamName: "CAD", teamLead: "CRAFTS RAVIND" },
  { sno: 98, psId: "SIH25090", category: "Hardware", organization: "Government of Kerala KERALA RURAL WATER SUPPLY AND SANITATION AGENCY, WATER RESOURCES DEPARTMENT, GOVERNMENT OF KERALA", department: "Government of Kerala KERALA RURAL WATER SUPPLY AND SANITATION AGENCY, WATER RESOURCES DEPARTMENT, GOVERNMENT OF KERALA", teamId: "90327", ideaId: "113846", teamName: "FAB", teamLead: "3 Rathnad M" },
  { sno: 99, psId: "SIH25091", category: "Software", organization: "Government of Jammu and Kashmir", department: "Higher Education Department", teamId: "62526", ideaId: "82521", teamName: "Eklavya_01", teamLead: "Jayesh J" },
  { sno: 100, psId: "SIH25092", category: "Software", organization: "Government of Jammu and Kashmir", department: "Higher Education Department", teamId: "74237", ideaId: "68942", teamName: "TeenTitans", teamLead: "Aditya P" },
  { sno: 101, psId: "SIH25093", category: "Software", organization: "Government of Jammu and Kashmir", department: "Higher Education Department", teamId: "53143", ideaId: "76925", teamName: "HackHounds", teamLead: "Hari Pra" },
];

export const PS_CATEGORIES = [...new Set(PS_RECORDS.map((r) => r.category))].sort();
export const PS_ORGANIZATIONS = [...new Set(PS_RECORDS.map((r) => r.organization))].sort();
export const PS_DEPARTMENTS = [...new Set(PS_RECORDS.map((r) => r.department))].sort();

export type PsSortKey = "sno" | "psId" | "organization" | "teamName";

export function filterRecords(
  records: PsRecord[],
  opts: { query?: string; category?: string; organization?: string; department?: string; team?: string; sort?: PsSortKey },
): PsRecord[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  const out = records.filter((r) => {
    if (opts.category && r.category !== opts.category) return false;
    if (opts.organization && r.organization !== opts.organization) return false;
    if (opts.department && r.department !== opts.department) return false;
    if (opts.team && !r.teamName.toLowerCase().includes(opts.team.toLowerCase())) return false;
    if (!q) return true;
    return [r.psId, r.organization, r.department, r.teamName, r.teamLead, r.teamId, r.ideaId, r.category]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
  const sort = opts.sort ?? "sno";
  return out.sort((a, b) =>
    sort === "sno" ? a.sno - b.sno : String(a[sort]).localeCompare(String(b[sort])),
  );
}

/** Future CSV/JSON import hook: map arbitrary rows onto PsRecord without UI changes. */
export function importRecords(rows: Array<Record<string, unknown>>): PsRecord[] {
  return rows.map((row, i) => ({
    sno: Number(row["sno"] ?? i + 1),
    psId: String(row["psId"] ?? row["ps_id"] ?? ""),
    category: (String(row["category"] ?? "Software") === "Hardware" ? "Hardware" : "Software"),
    organization: String(row["organization"] ?? ""),
    department: String(row["department"] ?? ""),
    teamId: String(row["teamId"] ?? row["team_id"] ?? ""),
    ideaId: String(row["ideaId"] ?? row["idea_id"] ?? ""),
    teamName: String(row["teamName"] ?? row["team_name"] ?? ""),
    teamLead: String(row["teamLead"] ?? row["team_lead"] ?? ""),
  }));
}
