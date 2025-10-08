import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import "../css/Hero.css";
import { heroPicks } from "../data/heroPicksData";

export default function Hero() {
    const topPicks = heroPicks;
    const numSlides = topPicks.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);

    // Refs
    const heroRef = useRef(null);
    const trackRef = useRef(null); // Ref for direct DOM manipulation of the track
    const paginationRef = useRef(null);
    const autoPlayTimer = useRef(null);
    const restartTimer = useRef(null);

    // Refs for drag state
    const dragStartX = useRef(0);
    const dragDistance = useRef(0);
    const wasDragged = useRef(false);
    const startScrubIndex = useRef(0);

    const handlePrev = useCallback(() => setActiveIndex((p) => (p - 1 + numSlides) % numSlides), [numSlides]);
    const handleNext = useCallback(() => setActiveIndex((p) => (p + 1) % numSlides), [numSlides]);

    const stopAutoPlay = useCallback(() => {
        setIsPlaying(false);
        clearInterval(autoPlayTimer.current);
    }, []);

    const startAutoPlay = useCallback(() => {
        if (numSlides <= 1) return;
        stopAutoPlay();
        setIsPlaying(true);
        autoPlayTimer.current = setInterval(handleNext, 4000);
    }, [handleNext, numSlides, stopAutoPlay]);

    const resetAutoPlayTimer = useCallback(() => {
        clearTimeout(restartTimer.current);
        stopAutoPlay();
        restartTimer.current = setTimeout(startAutoPlay, 6000); // 8-second delay
    }, [stopAutoPlay, startAutoPlay]);

    useEffect(() => {
        startAutoPlay();
        return () => {
            clearInterval(autoPlayTimer.current);
            clearTimeout(restartTimer.current);
        };
    }, [startAutoPlay]);

    // --- Main Swipe/Drag Logic ---
    const handleDragMove = useCallback((e) => {
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        dragDistance.current = currentX - dragStartX.current;
        if (Math.abs(dragDistance.current) > 10) wasDragged.current = true;

        // Live drag visual update
        if (trackRef.current) {
            const baseOffset = -activeIndex * trackRef.current.offsetWidth;
            trackRef.current.style.transform = `translateX(${baseOffset + dragDistance.current}px)`;
        }
    }, [activeIndex]);

    const handleDragEnd = useCallback(() => {
        if (trackRef.current) {
            trackRef.current.style.transition = ''; // Restore CSS transition
            trackRef.current.style.transform = ''; // Clear inline style
        }
        if (heroRef.current) heroRef.current.classList.remove('is-dragging');

        const swipeThreshold = 50;
        if (dragDistance.current > swipeThreshold) handlePrev();
        else if (dragDistance.current < -swipeThreshold) handleNext();

        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
    }, [handlePrev, handleNext, handleDragMove]);

    const handleDragStart = useCallback((e) => {
        resetAutoPlayTimer();
        dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
        dragDistance.current = 0;
        wasDragged.current = false;

        if (heroRef.current) heroRef.current.classList.add('is-dragging');
        if (trackRef.current) trackRef.current.style.transition = 'none'; // Disable transition for snappy drag

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove);
        window.addEventListener('touchend', handleDragEnd);
    }, [resetAutoPlayTimer, handleDragMove, handleDragEnd]);

    // --- Active Dot Scrubbing Logic ---
    const handleScrubMove = useCallback((e) => {
        if (!isScrubbing || numSlides <= 1) return;
        const paginationWidth = paginationRef.current?.offsetWidth || 200;
        const pixelsPerIndex = paginationWidth / (numSlides - 1 || 1);
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const dragDist = currentX - dragStartX.current;
        const indexOffset = Math.round(dragDist / pixelsPerIndex);
        const newIndex = startScrubIndex.current + indexOffset;
        const clampedIndex = Math.max(0, Math.min(newIndex, numSlides - 1));
        if (clampedIndex !== activeIndex) setActiveIndex(clampedIndex);
    }, [isScrubbing, activeIndex, numSlides]);

    const handleScrubEnd = useCallback(() => setIsScrubbing(false), []);

    const handleScrubStart = useCallback((e) => {
        e.stopPropagation();
        resetAutoPlayTimer();
        setIsScrubbing(true);
        dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
        startScrubIndex.current = activeIndex;
    }, [resetAutoPlayTimer, activeIndex]);

    useEffect(() => {
        if (isScrubbing) {
            document.body.classList.add('scrubbing');
            window.addEventListener('mousemove', handleScrubMove);
            window.addEventListener('mouseup', handleScrubEnd);
            window.addEventListener('touchmove', handleScrubMove);
            window.addEventListener('touchend', handleScrubEnd);
        }
        return () => {
            document.body.classList.remove('scrubbing');
            window.removeEventListener('mousemove', handleScrubMove);
            window.removeEventListener('mouseup', handleScrubEnd);
            window.removeEventListener('touchmove', handleScrubMove);
            window.removeEventListener('touchend', handleScrubEnd);
        };
    }, [isScrubbing, handleScrubMove, handleScrubEnd]);

    const handleClick = useCallback((e) => {
        if (wasDragged.current) e.preventDefault();
    }, []);

    const trackStyles = { transform: `translateX(-${activeIndex * 100}%)` };
    const getSlideBackgroundStyle = (images) => (images?.[0] ? { backgroundImage: `url(${images[0]})` } : {});

    return (
        <section className="top-picks-hero" ref={heroRef}>
            <div
                className="carousel-track"
                ref={trackRef}
                style={trackStyles}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                {topPicks.map((pick, index) => (
                    <Link
                        key={pick.id} to="/services" state={{ preSelectedServiceIds: pick.packageServiceIds }}
                        className="slide-item" draggable="false" onClick={handleClick}
                    >
                        <div className={`slide-background ${activeIndex === index ? 'active' : ''}`} style={getSlideBackgroundStyle(pick.images)} />
                        <div className="hero-content">
                            <div className={`hero-details ${activeIndex === index ? 'active' : ''}`}>
                                <div className="hero-text-content">
                                    <span className="hero-tag">{pick.tag}</span>
                                    <h2 className="hero-title">{pick.title}</h2>
                                    <p className="hero-description">{pick.description}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {numSlides > 1 && (
                <>
                    <button onClick={() => { resetAutoPlayTimer(); handlePrev(); }} className="nav-arrow prev" aria-label="Previous slide"><ChevronLeft size={28} /></button>
                    <button onClick={() => { resetAutoPlayTimer(); handleNext(); }} className="nav-arrow next" aria-label="Next slide"><ChevronRight size={28} /></button>
                    <div className="carousel-controls-overlay">
                        <div
                            className="carousel-controls"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            <div className="pagination-dots" ref={paginationRef}>
                                {topPicks.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`dot ${activeIndex === index ? 'active' : ''}`}
                                        onClick={() => { resetAutoPlayTimer(); setActiveIndex(index); }}
                                        onMouseDown={activeIndex === index ? handleScrubStart : undefined}
                                        onTouchStart={activeIndex === index ? handleScrubStart : undefined}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}