import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../App.css';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import confetti from 'canvas-confetti';

const ProblemDetails = () => {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [codeByLanguage, setCodeByLanguage] = useState({
        cpp: '',
        python: '',
        java: '',
    });

    const [language, setLanguage] = useState('cpp');
    const [verdict, setVerdict] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [submissionHistory, setSubmissionHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [compileResult, setCompileResult] = useState(null);
    const [compiled, setCompiled] = useState(false);
    const [lastCompiledCode, setLastCompiledCode] = useState('');
    const [compiling, setCompiling] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [shake, setShake] = useState(false);
const [customInput, setCustomInput] = useState('');
const [runOutput, setRunOutput] = useState(null);
const [running, setRunning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
axios.get(`${process.env.REACT_APP_API_URL}/api/problems/${id}`)
            .then((response) => {
                setProblem(response.data.problem);
            })
            .catch((error) => console.error('Error fetching problem:', error));

axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/${id}`)
            .then((res) => {
                if (res.data.success) {
                    setSubmissionHistory(res.data.submissions);
                }
            })
            .catch((err) => console.error('Error fetching submissions:', err));
    }, [id]);

const handleCompile = () => {
    setCompileResult(null);
    setCompiled(false);
    setCompiling(true);
    const currentCode = codeByLanguage[language];
    setLastCompiledCode(currentCode);
    setVerdict('');
    setTestResult(null);

    axios.post(`${process.env.REACT_APP_API_URL}/api/problems/${id}/compile`, {
        code: currentCode,
        language,
    })
        .then(() => {
            setCompiling(false);
            setCompiled(true);
            setCompileResult({
                success: true,
                message: '✓ Compilation successful!'
            });
        })
        .catch((error) => {
            setCompiling(false);
            setCompiled(false);
            const errorData = error.response?.data || {};
            setCompileResult({
                success: false,
                message: '✗ Compilation failed',
                error: errorData.error || error.message
            });
        });
};
const handleRun = async () => {
    const currentCode = codeByLanguage[language];

    if (!compiled || currentCode !== lastCompiledCode) {
        setRunOutput({
            error: 'Please compile your code first before running'
        });
        return;
    }

    setRunning(true);
    setRunOutput(null);

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/problems/${id}/run`, {
            code: currentCode,
            language,
            input: customInput,
        });
        setRunOutput({
            output: response.data.output,
            error: response.data.error,
        });
    } catch (error) {
        const errMsg = error.response?.data?.error || error.message;
        setRunOutput({ error: errMsg });
    } finally {
        setRunning(false);
    }
};
    const handleSubmit = async () => {
        const currentCode = codeByLanguage[language];

        if (!compiled || currentCode !== lastCompiledCode) {
            setCompileResult({
                success: false,
                message: 'Please compile your latest code first or fix errors before submission',
            });
            return;
        }

        setSubmitting(true);
        setVerdict(null);
        setTestResult(null);
        setCompileResult(null);

        try {
            const response = await axios.post(`/api/problems/${id}/submit`, {
                code: currentCode,
                language,
            });

            setVerdict(response.data.result);
if (response.data.result === 'Success') {
    fireConfetti(); // ✅ 🎉 on all test cases passed
}else {
    setShake(false); // reset first
    setTimeout(() => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    }, 10); // tiny delay forces React to re-render and re-trigger animation
}
            setTestResult({
                passed: response.data.passed,
                total: response.data.total,
                details: response.data.testResults || [],
            });

            const historyRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/submissions/${id}`);
            if (historyRes.data.success) {
                setSubmissionHistory(historyRes.data.submissions);
            }

        } catch (error) {
            let errMsg = "Submission failed";
            if (error.response) {
                errMsg = error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
            } else if (error.message) {
                errMsg = error.message;
            }
            setVerdict(`Error: ${errMsg}`);
        } finally {
            setSubmitting(false);    
            }
    };

    const handleViewSubmission = (submission) => {
        setLanguage(submission.language);
        setCodeByLanguage((prev) => ({
            ...prev,
            [submission.language]: submission.code,
        }));
        setShowHistory(false);
        setVerdict(submission.result);
        setTestResult({
            passed: submission.passed,
            total: submission.total,
            details: submission.testResults || [],
        });
    };

    if (!problem) return <p>Loading problem details...</p>;

const getLanguageExtension = () => {
    if (language === 'cpp') return [cpp()];
    if (language === 'python') return [python()];
    if (language === 'java') return [java()];
    return [];
};
const fireConfetti = () => {
    confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#28a745', '#20c997', '#ffffff']
    });
};
    return (
        <div className="container mt-4">
            <div className="d-flex gap-2 mb-3">
                
   <button
    className="btn btn-outline-secondary px-4"
    onClick={() => showHistory ? setShowHistory(false) : navigate('/')}
>
    <i className="bi bi-arrow-left"></i> {showHistory ? 'Back to Problem' : 'Back to List'}
</button>

{!showHistory && (
    <button className="btn btn-outline-primary" onClick={() => setShowHistory(true)}>
        <i className="bi bi-clock-history"></i> Submission History
    </button>
)}
</div>

            {!showHistory && (
                <div className="row">
                    <div className="col-md-6">
                        <h2>{problem.title}</h2>
                        <p><strong>Description:</strong> {problem.statement}</p>
                        <p><strong>Examples:</strong></p>
                        {problem.examples.map((example, index) => {
                            const parts = example.split('Output:');
                            return (
                                <pre key={index}>
                                    <strong>Input:</strong> {parts[0].replace('Input:', '').trim()} <br />
                                    <strong>Output:</strong> {parts[1]?.trim() || ''}
                                </pre>
                            );
                        })}
                        <p><strong>Constraints:</strong></p>
                        <ul>
                            {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>

                    <div className="col-md-6">
                        <h4>Enter your code:</h4>
                        <div className="mb-3">
                            <label htmlFor="languageSelect" className="form-label">Select Language:</label>
                            <select
                                id="languageSelect"
                                className="form-select"
                                value={language}
onChange={(e) => {
    setLanguage(e.target.value);
    setVerdict('');
    setTestResult(null);
    setCompileResult(null);
    setCompiled(false);
    setLastCompiledCode('');
    setRunOutput(null);
setCustomInput('');
}}                            >
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                            </select>
                        </div>

                        <CodeMirror
    value={codeByLanguage[language]}
    height="350px"
    theme={vscodeDark}
    extensions={getLanguageExtension()}
    onChange={(value) =>
        setCodeByLanguage((prev) => ({
            ...prev,
            [language]: value,
        }))
    }
    style={{
        fontSize: '14px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid #444'
    }}
/>
{/* Compile result + verdict ABOVE buttons */}
{compileResult && (
    <div className={`mt-3 alert alert-${compileResult.success ? 'success' : 'danger'}`}>
        <strong>{compileResult.message}</strong>
        {compileResult.error && (
            <pre className="mt-2 mb-0 bg-dark text-white p-2 rounded">
                {compileResult.error}
            </pre>
        )}
    </div>
)}

{verdict && (
    <div className="mt-3">
<div className={`alert alert-${verdict === 'Success' ? 'success' : 'danger'} ${shake ? 'shake' : ''}`}>            <div className="d-flex justify-content-between align-items-center">
                <strong>Verdict: {verdict}</strong>
                {testResult && (
                    <span className="badge bg-secondary">
                        {testResult.passed}/{testResult.total} Test Cases Passed
                    </span>
                )}
            </div>
            {testResult?.details?.length > 0 && (
                <div className="mt-3">
                    <h5>Test Case Details:</h5>
                    <div className="table-responsive">
                       <table className="table table-sm table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
    <colgroup>
        <col style={{ width: '5%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '30%' }} />
    </colgroup>
    <thead className="table-dark">
        <tr>
            <th>#</th>
            <th>Input</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Status</th>
        </tr>
    </thead>
                            <tbody>
                                {testResult.details.map((test, index) => (
                                    <tr key={index}>
                                        <td style={{ wordBreak: 'break-word' }}>{index + 1}</td>
                                        <td style={{ wordBreak: 'break-word' }}>{test.input}</td>
                                        <td style={{ wordBreak: 'break-word' }}>{test.expectedOutput}</td>
                                        <td style={{ wordBreak: 'break-word' }}className={test.passed ? 'text-success' : 'text-danger'}>
                                            {test.result || 'N/A'}
                                            {test.error && (
                                                <pre className="mt-1 mb-0 text-danger" style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>
                                                    {test.error}
                                                </pre>
                                            )}
                                        </td>
                                        <td style={{ wordBreak: 'break-word' }}>
                                            <span className={`badge bg-${test.passed ? 'success' : test.result === 'Runtime error' ? 'warning' : 'danger'}`}>
                                                {test.passed ? '✅ Accepted' : test.result === 'Runtime error' ? '🚫 Runtime Error' : '❌ Wrong Answer'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    </div>
)}
{/* Row 1 — Compile and Submit buttons */}
<div className="d-flex gap-2 mt-3">
   <button
    className="btn btn-compile px-4"
    onClick={handleCompile}
    disabled={compiling || submitting || !codeByLanguage[language]}
>
    {compiling ? 'Compiling...' : '⚙️ Compile'}
</button>

<button
    className="btn btn-submit px-4"
    onClick={handleSubmit}
    disabled={submitting || compiling || !codeByLanguage[language]}
>
    {submitting ? 'Submitting...' : '🚀 Submit'}
</button>
</div>

{/* Row 2 — Custom Input */}
<div className="mt-3">
    <label className="form-label text-muted" style={{ fontSize: '13px' }}>
        Custom Input
    </label>
    <textarea
        className="form-control font-monospace"
        rows="3"
        placeholder="Enter custom input here..."
        value={customInput}
        onChange={(e) => setCustomInput(e.target.value)}
        style={{ fontSize: '13px', resize: 'vertical' }}
    />
</div>

{/* Row 3 — Run Code button on its own line */}
<div className="mt-2">
   <button
    className="btn btn-run mt-2"
    onClick={handleRun}
    disabled={running || compiling || submitting || !codeByLanguage[language]}
>
    {running ? '⏳ Running...' : '▶ Run Code'}
</button>
</div>

{/* Row 4 — Run output */}
{runOutput && (
    <div className="mt-3 rounded overflow-hidden" style={{ border: '1px solid #333' }}>
        {/* Terminal header bar */}
        <div className="d-flex align-items-center gap-2 px-3 py-2" style={{ background: '#1e1e1e' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} />
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
            <span className="ms-2" style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
                {runOutput.error ? 'stderr' : 'stdout'}
            </span>
        </div>
        {/* Terminal body */}
        <div style={{ background: '#0d0d0d', padding: '12px 16px', minHeight: '60px' }}>
            <pre style={{
                margin: 0,
                fontSize: '13px',
                fontFamily: 'Consolas, Monaco, monospace',
                color: runOutput.error ? '#ff6b6b' : '#4ec9b0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}>
                {runOutput.error || runOutput.output || '(no output)'}
            </pre>
        </div>
    </div>
)}

                  
                    </div>
                </div>
            )}

            {showHistory && (
                <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4>Submission History</h4>
                        
                    </div>

                    {submissionHistory.length === 0 ? (
                        <div className="alert alert-info">No submissions yet.</div>
                    ) : (
                        <div className="table-responsive">
                           <table className="table table-sm table-bordered" style={{ tableLayout: 'fixed', width: '100%' }}>
    <colgroup>
        <col style={{ width: '5%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '25%' }} />
        <col style={{ width: '30%' }} />
    </colgroup>
    <thead className="table-dark">
        <tr>
            <th>#</th>
            <th>Input</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Status</th>
        </tr>
    </thead>
                                <tbody>
                                    {submissionHistory.map((s, i) => (
                                        <tr key={s._id} onClick={() => handleViewSubmission(s)} style={{ cursor: 'pointer' }}>
                                            <td style={{ wordBreak: 'break-word' }}>{i + 1}</td>
                                            <td style={{ wordBreak: 'break-word' }}><span className="badge bg-primary">{s.language.toUpperCase()}</span></td>
                                            <td style={{ wordBreak: 'break-word' }}>
                                                <span className={`badge bg-${s.result === 'Success' ? 'success' : 'danger'}`}>
                                                    {s.result}
                                                </span>
                                            </td>
                                            <td style={{ wordBreak: 'break-word' }}>{s.passed}</td>
                                            <td style={{ wordBreak: 'break-word' }}>{s.total}</td>
                                            <td style={{ wordBreak: 'break-word' }}>{new Date(s.submittedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProblemDetails;
