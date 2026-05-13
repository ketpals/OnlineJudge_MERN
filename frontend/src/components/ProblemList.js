import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [originalProblems, setOriginalProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
axios.get(`${process.env.REACT_APP_API_URL}/api/problems`)
            .then((response) => {
                setProblems(response.data.problems);
                setOriginalProblems(response.data.problems);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching problem list:', error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (searchVisible && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchVisible]);

    const difficultyRank = { Easy: 1, Medium: 2, Hard: 3 };

    const handleSort = (order) => {
        if (order === 'default') {
            setProblems([...originalProblems]);
            return;
        }
        const sortedProblems = [...originalProblems].sort((a, b) => {
            const rankA = difficultyRank[a.difficulty] || 0;
            const rankB = difficultyRank[b.difficulty] || 0;
            return order === 'asc' ? rankA - rankB : rankB - rankA;
        });
        setProblems(sortedProblems);
    };

    const handleSortBySolved = (order) => {
        const sorted = [...originalProblems].sort((a, b) => {
            const aSolved = a.solved ? 1 : 0;
            const bSolved = b.solved ? 1 : 0;
            return order === 'solvedFirst' ? bSolved - aSolved : aSolved - bSolved;
        });
        setProblems(sorted);
    };

    const handleProblemClick = (id) => navigate(`/problem/${id}`);

    const easyTotal   = originalProblems.filter(p => p.difficulty === 'Easy').length;
    const mediumTotal = originalProblems.filter(p => p.difficulty === 'Medium').length;
    const hardTotal   = originalProblems.filter(p => p.difficulty === 'Hard').length;
    const easySolved   = originalProblems.filter(p => p.difficulty === 'Easy'   && p.solved).length;
    const mediumSolved = originalProblems.filter(p => p.difficulty === 'Medium' && p.solved).length;
    const hardSolved   = originalProblems.filter(p => p.difficulty === 'Hard'   && p.solved).length;

    const pct = (solved, total) => total ? Math.round((solved / total) * 100) : 0;

    return (
        <div className="container mt-4">

            {/* ── Row 1: Title + Search + Sort ── */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Problem List</h2>
                <div className="d-flex align-items-center gap-2">

                    {/* Search */}
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => { setSearchVisible(!searchVisible); setSearchTerm(''); }}
                        title={searchVisible ? 'Close Search' : 'Search'}
                    >
                        {searchVisible ? <FaTimes /> : <FaSearch />}
                    </button>
                    {searchVisible && (
                        <input
                            type="text"
                            ref={searchInputRef}
                            className="form-control"
                            placeholder="Search by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '200px', transition: 'width 0.3s' }}
                        />
                    )}

                    {/* Sort */}
                    <div className="dropdown">
                        <button
                            className="btn btn-secondary dropdown-toggle"
                            type="button"
                            id="sortDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Sort Options
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="sortDropdown">
                            <li><strong className="dropdown-header">By Difficulty</strong></li>
                            <li><button className="dropdown-item" onClick={() => handleSort('default')}>Default Order</button></li>
                            <li><button className="dropdown-item" onClick={() => handleSort('asc')}>Easy → Hard</button></li>
                            <li><button className="dropdown-item" onClick={() => handleSort('desc')}>Hard → Easy</button></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><strong className="dropdown-header">By Solved Status</strong></li>
                            <li><button className="dropdown-item" onClick={() => handleSortBySolved('solvedFirst')}>Solved</button></li>
                            <li><button className="dropdown-item" onClick={() => handleSortBySolved('unsolvedFirst')}>Unsolved</button></li>
                        </ul>
                    </div>

                </div>
            </div>

            {/* ── Row 2: Total solved count ── */}
            <div className="d-flex align-items-baseline gap-2 mb-3">
                <span style={{ fontSize: '28px', fontWeight: 500 }}>
                    {easySolved + mediumSolved + hardSolved}
                </span>
                <span className="text-muted" style={{ fontSize: '13px' }}>
                    of {easyTotal + mediumTotal + hardTotal} solved
                </span>
            </div>

            {/* ── Row 3: Stat cards ── */}
            <div className="row g-2 mb-3">
                {[
                    { label: 'Easy',   solved: easySolved,   total: easyTotal,   bg: '#EAF3DE', color: '#3B6D11', bar: '#639922' },
                    { label: 'Medium', solved: mediumSolved, total: mediumTotal, bg: '#FAEEDA', color: '#854F0B', bar: '#BA7517' },
                    { label: 'Hard',   solved: hardSolved,   total: hardTotal,   bg: '#FCEBEB', color: '#A32D2D', bar: '#E24B4A' },
                ].map(({ label, solved, total, bg, color, bar }) => (
                    <div className="col-4" key={label}>
                        <div className="p-3 rounded" style={{ background: 'var(--bs-secondary-bg)' }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="badge rounded-pill" style={{ background: bg, color, fontSize: '11px' }}>{label}</span>
                                <small className="text-muted">{solved}/{total}</small>
                            </div>
                            <div className="progress mt-2" style={{ height: '8px', background: 'var(--bs-tertiary-bg)' }}>
                                <div
                                    className="progress-bar"
                                    style={{ width: `${pct(solved, total)}%`, background: bar, transition: 'width 1s cubic-bezier(.4,0,.2,1)' }}
                                />
                            </div>
                            <p className="mb-0 mt-2" style={{ fontSize: '22px', fontWeight: 500 }}>
                                {pct(solved, total)}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Row 4: Detailed progress rows ── */}
           

            {/* ── Row 5: Problem list ── */}
            <div className="list-group">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="list-group-item d-flex justify-content-between align-items-center">
                            <Skeleton width={200} height={20} />
                            <Skeleton width={80} height={24} borderRadius={12} />
                        </div>
                    ))
                ) : (
                    problems
                        .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((problem) => (
                            <div
                                key={problem._id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handleProblemClick(problem._id)}
                                style={{ cursor: 'pointer', backgroundColor: problem.solved ? '#e6ffe6' : '' }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{problem.title}</h5>
                                    <div>
                                        <span className={`badge me-2 ${problem.difficulty === 'Easy' ? 'bg-success' : problem.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'}`}>
                                            {problem.difficulty === 'Easy' ? '🟢' : problem.difficulty === 'Medium' ? '🟡' : '🔴'} {problem.difficulty}
                                        </span>
                                        {problem.solved && (
                                            <span className="badge bg-primary">✔ Solved</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                )}
            </div>

        </div>
    );
};

export default ProblemList;