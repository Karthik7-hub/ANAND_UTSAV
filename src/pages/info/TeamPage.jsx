import React from 'react';
import { FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import '../../css/FooterPages.css';

const teamMembers = [
    {
        name: "Vana Karthik",
        role: "Core Developer & Contributor",
        email: "vkarthik4321@gmail.com",
        secondaryEmail: "vkarthik104.btech2023@cse.nitrr.ac.in",
        linkedin: "https://www.linkedin.com/in/vana-karthik-36aa25290/",
        github: "https://github.com/Karthik7-hub",
        initials: "VK"
    },
    {
        name: "Nihal Reddy",
        role: "Core Developer & Contributor",
        email: "nihalreddy.vanga@gmail.com",
        linkedin: "https://www.linkedin.com/in/nihal-reddy-75a188286/",
        github: "https://github.com/reddyn2k6",
        initials: "NR"
    },
    {
        name: "Yerragudi Rishika Reddy",
        role: "Core Developer & Contributor",
        email: "yrishikareddy123@gmail.com",
        linkedin: "https://www.linkedin.com/in/rishika-reddy-172ab3291/",
        github: "https://github.com/ris1005",
        initials: "RR"
    },
    {
        name: "Palle Vinay Reddy",
        role: "Core Developer & Contributor",
        email: "pallevinayreddy26@gmail.com",
        linkedin: "https://www.linkedin.com/in/palle-vinay-reddy-8983b1292/",
        github: "https://github.com/vinayreddy2006",
        initials: "VR"
    },
    {
        name: "Vagmin Chiluka",
        role: "Core Developer & Contributor",
        email: "Vagmin1234@gmail.com",
        linkedin: "https://www.linkedin.com/in/chilukavagmin/",
        github: "https://github.com/vagmin27",
        initials: "VC"
    },
    {
        name: "Bharathula Vishnu Vardhan",
        role: "Core Developer & Contributor",
        email: "vardhanbharathula@gmail.com",
        linkedin: null,
        github: null,
        initials: "VV"
    }
];

const TeamPage = () => {
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
                    <div className="team-card" key={index}>
                        <div className="team-avatar">{member.initials}</div>
                        <h3 className="team-name">{member.name}</h3>
                        <div className="team-role">{member.role}</div>
                        
                        <div className="team-email">
                            <FaEnvelope style={{ marginRight: '5px', color: '#ff8800' }} />
                            <a href={`mailto:${member.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {member.email}
                            </a>
                        </div>

                        {member.secondaryEmail && (
                            <div className="team-email" style={{ fontSize: '0.8rem', marginTop: '-8px' }}>
                                Academic: <a href={`mailto:${member.secondaryEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>{member.secondaryEmail}</a>
                            </div>
                        )}

                        <div className="team-socials">
                            {member.linkedin && (
                                <a 
                                    href={member.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="team-social-btn linkedin"
                                    title="LinkedIn Profile"
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
                                >
                                    <FaGithub /> GitHub
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="info-section" style={{ marginTop: '3rem', textAlign: 'center' }}>
                <h2>Institution & Credits</h2>
                <p>
                    <strong>National Institute of Technology (NIT) Raipur</strong><br />
                    Raipur, Chhattisgarh, India
                </p>
            </div>
        </div>
    );
};

export default TeamPage;
