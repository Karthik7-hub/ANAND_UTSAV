import React from 'react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import '../../css/FooterPages.css';

const teamMembers = [
    {
        name: "Vana Karthik",
        role: "Frontend Development & API Management",
        email: "vkarthik4321@gmail.com",
        secondaryEmail: "vkarthik104.btech2023@cse.nitrr.ac.in",
        linkedin: "https://www.linkedin.com/in/vana-karthik-36aa25290/",
        github: "https://github.com/Karthik7-hub",
        initials: "VK",
        contributions: [
            "Built the frontend user interface and application pages.",
            "Connected frontend screens with backend APIs and routes.",
            "Handled app routing, state management, and client architecture.",
            "Designed overall UI layout and user experience."
        ]
    },
    {
        name: "Yerragudi Rishika Reddy",
        role: "Frontend Development & API Management",
        email: "yrishikareddy123@gmail.com",
        linkedin: "https://www.linkedin.com/in/rishika-reddy-172ab3291/",
        github: "https://github.com/ris1005",
        initials: "RR",
        contributions: [
            "Created frontend UI components and pages.",
            "Worked on frontend API calls and data integration.",
            "Managed client-side form validations and interactive components.",
            "Helped refine UI layouts and user flows across pages."
        ]
    },
    {
        name: "Nihal Reddy",
        role: "Backend Development & Project Management",
        email: "nihalreddy.vanga@gmail.com",
        linkedin: "https://www.linkedin.com/in/nihal-reddy-75a188286/",
        github: "https://github.com/reddyn2k6",
        initials: "NR",
        contributions: [
            "Designed the backend architecture and server setup.",
            "Created REST API routes and database schemas.",
            "Managed user auth, server-side logic, and backend deployment.",
            "Led backend coordination and project planning."
        ]
    },
    {
        name: "Palle Vinay Reddy",
        role: "Backend Development & Project Management",
        email: "pallevinayreddy26@gmail.com",
        linkedin: "https://www.linkedin.com/in/palle-vinay-reddy-8983b1292/",
        github: "https://github.com/vinayreddy2006",
        initials: "VR",
        contributions: [
            "Developed backend API endpoints and data models.",
            "Managed database setup and server performance.",
            "Worked on backend architecture and project tasks.",
            "Monitored server stability and error handling."
        ]
    },
    {
        name: "Vagmin Chiluka",
        role: "Chat Application, APIs & Frontend",
        email: "Vagmin1234@gmail.com",
        linkedin: "https://www.linkedin.com/in/chilukavagmin/",
        github: "https://github.com/vagmin27",
        initials: "VC",
        contributions: [
            "Built the real-time chat system using Socket.IO.",
            "Created messaging APIs and database models.",
            "Integrated chat UI components into the frontend.",
            "Handled live message delivery and active chat state."
        ]
    },
    {
        name: "Bharathula Vishnu Vardhan",
        role: "Machine Learning Engine Design",
        email: "vardhanbharathula@gmail.com",
        linkedin: null,
        github: null,
        initials: "VV",
        contributions: [
            "Built the machine learning search and recommendation engine.",
            "Developed recommendation model pipelines and inference scripts.",
            "Integrated ML search endpoints with the backend.",
            "Worked on search scoring and AI recommendation features."
        ]
    }
];

const TeamPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Our Team</span>
                <h1>Meet Team Anand Utsav</h1>
                <p>
                    Students of <strong>National Institute of Technology (NIT) Raipur</strong> building Anand Utsav.
                </p>
            </div>

            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div className="team-card" key={index}>
                        <div className="team-card-header">
                            <div className="team-avatar">{member.initials}</div>
                            <div className="team-card-info">
                                <h3 className="team-name">{member.name}</h3>
                                <div className="team-role">{member.role}</div>
                            </div>
                        </div>

                        <div className="team-work-section">
                            <h4 className="team-work-title">What they worked on:</h4>
                            <ul className="team-work-list">
                                {member.contributions.map((item, cIndex) => (
                                    <li key={cIndex}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="team-footer-socials">
                            {member.linkedin && (
                                <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="team-social-btn linkedin"
                                >
                                    <FaLinkedin /> LinkedIn
                                </a>
                            )}
                            {member.github && (
                                <a 
                                    href={member.github} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="team-social-btn github"
                                >
                                    <FaGithub /> GitHub
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-section info-cta-section">
                <h2>NIT Raipur</h2>
                <p>
                    National Institute of Technology Raipur, Chhattisgarh, India
                </p>
            </div>
        </div>
    );
};

export default TeamPage;
