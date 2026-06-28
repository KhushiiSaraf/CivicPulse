import { CivicIssue } from "./types";

export const SAMPLE_ISSUES: CivicIssue[] = [
  {
    id: "issue-1",
    description: "Extremely deep and dangerous pothole right in the middle of the active lane on Westside Boulevard. Vehicles are swerving into oncoming traffic to avoid it, which is incredibly risky especially during peak hours.",
    location: "412 Westside Boulevard, near Central Junction",
    category: "pothole",
    severity: "High",
    summary: "Deep, hazardous pothole in the active traffic lane causing dangerous swerving.",
    status: "Reported",
    createdAt: "2026-06-25T14:30:00Z",
    mapX: 35,
    mapY: 45,
    lat: 37.7793,
    lng: -122.4283,
    reporterId: "user-sarah",
    reporterName: "Sarah Jenkins",
    complaintLetter: `To,
The Municipal Commissioner,
City Municipal Corporation,
Office of Civic Infrastructure Engineering

Subject: Urgent Action Required: Hazardous Road Pothole at 412 Westside Boulevard

Dear Sir/Madam,

I am writing to officially report a severe and dangerous pothole located in the center of the westbound lane at 412 Westside Boulevard, just before the Central Junction intersection.

This road is a major artery for our local community, carrying substantial daily traffic, including school buses and local commuters. At present, the pothole is over 8 inches deep and is forcing drivers to swerve abruptly into the oncoming lane to prevent severe vehicle damage. This creates a critical risk of head-on collisions, particularly at night when visibility is compromised.

Given the potential for serious traffic accidents and damage to public and private property, I request your department to treat this as an emergency matter. We urge the municipal engineering team to complete a durable repair or asphalt patching on this section as soon as possible.

Thank you for your prompt response and dedication to citizen safety.

Sincerely,
Concerned Citizen
Submitted via CivicPulse Platform`,
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "issue-2",
    description: "The entire stretch of streetlights on Maple Avenue is completely dark. The lights have been out for three days, creating a pitch-black zone that feels very unsafe for pedestrians walking home from the transit station.",
    location: "700 Block Maple Avenue (between 7th and 8th St)",
    category: "streetlight",
    severity: "Medium",
    summary: "Complete streetlight outage across a full block causing safety and security concerns.",
    status: "In Progress",
    createdAt: "2026-06-24T21:15:00Z",
    mapX: 62,
    mapY: 30,
    lat: 37.7684,
    lng: -122.4102,
    reporterId: "user-alex",
    reporterName: "Alex Rivera",
    complaintLetter: `To,
The Director of Public Works,
Municipal Utility and Streetlighting Division

Subject: Public Safety Complaint: Complete Streetlight Outage on Maple Avenue

Dear Sir/Madam,

I am writing to draw your attention to a complete streetlighting failure on Maple Avenue, specifically covering the entire 700 block between 7th Street and 8th Street.

For the past three consecutive nights, every lamp post on this stretch has remained entirely inactive. This area is highly residential and serves as a primary pedestrian route from the nearby commuter rail station. The resulting darkness creates an unsafe environment, increasing risks of trip-and-fall injuries on uneven pavement and raising significant personal security concerns among local residents.

We kindly request that an emergency maintenance crew inspect the circuit box or replace the faulty components along this block to restore illumination. Adequate lighting is vital to deterring crime and ensuring pedestrian safety.

Your immediate attention and prompt action in resolving this issue will be highly appreciated by the neighborhood.

Sincerely,
Maple Avenue Resident Association
Submitted via CivicPulse Platform`,
    imageUrl: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "issue-3",
    description: "An enormous pile of uncollected garbage has accumulated right next to the municipal children's park. It is starting to smell awful and is attracting flies, stray dogs, and rodents, posing a major sanitation issue.",
    location: "Sunnyvale Children's Park, East Entrance",
    category: "garbage",
    severity: "Critical",
    summary: "Large, unsanitary garbage accumulation attracting rodents near children's park entrance.",
    status: "Resolved",
    createdAt: "2026-06-22T09:00:00Z",
    mapX: 78,
    mapY: 65,
    lat: 37.7612,
    lng: -122.4356,
    reporterId: "user-marcus",
    reporterName: "Marcus Chen",
    complaintLetter: `To,
The Chief Sanitation Inspector,
Municipal Waste Management Bureau

Subject: Urgent Request: Sanitation Hazard and Uncollected Waste at Sunnyvale Park

Dear Sir/Madam,

I am writing to bring to your urgent notice a severe sanitation hazard that has developed at the east entrance of the Sunnyvale Children's Park.

Over the past week, a substantial mound of household and commercial refuse has been left uncollected. This waste pile is now overflowing onto the pedestrian pathway directly leading into the children's play area. It has begun to decompose, emitting a foul odor, and is actively attracting rodents, insects, and stray animals. This creates an unacceptable public health threat to the hundreds of families and young children who visit this park daily.

We request an immediate dispatch of sanitation services to clear this accumulation and clean the affected ground. Furthermore, we ask that a permanent waste bin be installed with regular daily clearing scheduled to prevent this hazard from reoccurring.

Thank you for your immediate intervention in safeguarding public health and preserving our community spaces.

Sincerely,
Sunnyvale Community Volunteers
Submitted via CivicPulse Platform`,
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400"
  }
];
