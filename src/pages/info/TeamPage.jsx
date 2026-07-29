import React, { useState } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaTimes } from 'react-icons/fa';
import '../../css/FooterPages.css';

const teamMembers = [
    {
        name: "Vana Karthik",
        role: "Frontend Development & API Management",
        email: "vkarthik4321@gmail.com",
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
        linkedin: "https://www.linkedin.com/in/bharathula-vishnu-vardhan-47753828a/",
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
    const [selectedMember, setSelectedMember] = useState(null);

    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Creators & Developers</span>
                <h1>Meet Team Anand Utsav</h1>
                <p>
                    Built with passion by computer science and engineering students of NIT Raipur. We are dedicated to creating seamless digital experiences for campus celebrations.
                </p>
            </div>

            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div 
                        className="team-card" 
                        key={index} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedMember(member)}
                    >
                        <div className="team-avatar">{member.initials}</div>
                        <h3 className="team-name">{member.name}</h3>
                        <div className="team-role">{member.role}</div>
                        
                        <div className="team-email">
                            <FaEnvelope style={{ marginRight: '5px', color: '#ff8800' }} />
                            <a href={`mailto:${member.email}`} onClick={(e) => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {member.email}
                            </a>
                        </div>

                        <div className="team-socials">
                            {member.linkedin && (
                                <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="team-social-btn linkedin"
                                    title="LinkedIn Profile"
                                    onClick={(e) => e.stopPropagation()}
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
                                    title="GitHub Profile"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FaGithub /> GitHub
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-section" style={{ marginTop: '3rem', textAlign: 'center' }}>
                <h2 style={{ borderLeft: 'none', paddingLeft: 0 }}>Institution & Credits</h2>
                <p style={{ margin: 0 }}>
                    <strong>National Institute of Technology (NIT) Raipur</strong><br />
                    Raipur, Chhattisgarh, India
                </p>
            </div>

            {/* Contribution Modal Popup */}
            {selectedMember && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.5rem'
                    }}
                    onClick={() => setSelectedMember(null)}
                >
                    <div 
                        style={{
                            background: 'var(--bg-secondary, #ffffff)',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            borderRadius: '24px',
                            padding: '2.2rem',
                            maxWidth: '500px',
                            width: '100%',
                            position: 'relative',
                            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-color, #1e1e24)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            style={{
                                position: 'absolute',
                                top: '1.2rem',
                                right: '1.2rem',
                                background: 'var(--border-color, #eee)',
                                color: 'var(--text-color, #333)',
                                border: 'none',
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedMember(null)}
                            title="Close"
                        >
                            <FaTimes />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div className="team-avatar" style={{ margin: '0 auto 0.8rem auto' }}>{selectedMember.initials}</div>
                            <h3 className="team-name" style={{ marginBottom: '0.2rem' }}>{selectedMember.name}</h3>
                            <div className="team-role" style={{ color: '#ff8800', fontWeight: '600' }}>{selectedMember.role}</div>
                        </div>

                        <div style={{ textAlign: 'left', margin: '1rem 0' }}>
                            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-color)', opacity: 0.85, marginBottom: '0.6rem' }}>What they worked on:</h4>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-color-light, #555)' }}>
                                {selectedMember.contributions.map((item, cIndex) => (
                                    <li key={cIndex} style={{ marginBottom: '0.4rem' }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamPage;
