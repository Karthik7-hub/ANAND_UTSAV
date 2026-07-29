import React from 'react';
import { FaBlog, FaCalendarAlt, FaUserEdit, FaTag } from 'react-icons/fa';
import '../../css/FooterPages.css';

const blogPosts = [
    {
        title: "How to Plan an Unforgettable College Fest on a Budget",
        author: "Anand Utsav Team",
        date: "July 20, 2026",
        category: "Event Planning",
        excerpt: "From sound systems to stage lighting, discover expert tips from NIT Raipur student organizers on organizing successful campus events without breaking the bank."
    },
    {
        title: "Top 5 Service Provider Checklist for Campus Ceremonies",
        author: "Vana Karthik",
        date: "July 12, 2026",
        category: "Guides",
        excerpt: "Ensure your photographers, caterers, and decorators deliver 100% on the big day. Essential questions to ask before confirming your bookings."
    },
    {
        title: "Empowering Student Entrepreneurs through Anand Utsav",
        author: "NIT Raipur Student Council",
        date: "June 28, 2026",
        category: "Community",
        excerpt: "How our platform is helping talented campus musicians, designers, and event managers launch their freelance careers while studying."
    }
];

const BlogPage = () => {
    return (
        <div className="info-page-container">
            <div className="info-hero">
                <span className="info-badge">Community Stories & Tips</span>
                <h1>Anand Utsav Blog</h1>
                <p>
                    Insights, event planning guides, campus stories, and updates from the NIT Raipur development team.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {blogPosts.map((post, idx) => (
                    <div className="info-section" key={idx} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ fontSize: '0.85rem', color: '#ff8800', fontWeight: '600', marginBottom: '0.5rem' }}>
                            <FaTag style={{ marginRight: '4px' }} /> {post.category}
                        </div>
                        <h3 style={{ marginTop: 0, fontSize: '1.3rem' }}>{post.title}</h3>
                        <p style={{ flexGrow: 1 }}>{post.excerpt}</p>
                        <div style={{ fontSize: '0.85rem', color: '#777', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span><FaUserEdit /> {post.author}</span>
                            <span><FaCalendarAlt /> {post.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
