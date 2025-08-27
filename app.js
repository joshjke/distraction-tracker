import React, { useState, useEffect } from 'react';

const DistractionTracker = () => {
  // State variables
  const [distractionCount, setDistractionCount] = useState(0);
  const [closedDistractionCount, setClosedDistractionCount] = useState(0);
  const [flowStateCount, setFlowStateCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(new Date());
  const [lastBreakTime, setLastBreakTime] = useState(new Date());
  const [timeSinceClick, setTimeSinceClick] = useState('--');
  const [timeSinceBreak, setTimeSinceBreak] = useState('--');
  const [breakNeedsBold, setBreakNeedsBold] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [flowReasonText, setFlowReasonText] = useState('');
  const [sessionData, setSessionData] = useState([]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const clickDiff = now - lastClickTime;
      const breakDiff = now - lastBreakTime;

      setTimeSinceClick(formatTimeSpan(clickDiff));
      setTimeSinceBreak(formatTimeSpan(breakDiff));
      setBreakNeedsBold(breakDiff >= 30 * 60 * 1000); // 30 minutes in milliseconds
    }, 1000);

    return () => clearInterval(timer);
  }, [lastClickTime, lastBreakTime]);

  const formatTimeSpan = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours >= 1) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes >= 1) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const logToData = (eventType, reason = '') => {
    const now = new Date();
    const timeSinceClickMinutes = (now - lastClickTime) / (1000 * 60);
    const timeSinceBreakMinutes = (now - lastBreakTime) / (1000 * 60);
    
    const entry = {
      timestamp: now.toISOString(),
      event: eventType,
      distractionCount,
      closedDistractionCount,
      flowStateCount,
      timeSinceLastClick: timeSinceClickMinutes.toFixed(2),
      timeSinceLastBreak: timeSinceBreakMinutes.toFixed(2),
      reason: reason || 'No reason provided'
    };

    setSessionData(prev => [...prev, entry]);
  };

  const handleDistraction = () => {
    const newCount = distractionCount + 1;
    setDistractionCount(newCount);
    
    const reason = reasonText.trim() || 'No reason provided';
    logToData('Distraction', reason);
    
    setLastClickTime(new Date());
    setReasonText('');
    
    alert('Stay focused! You\'ve got this! 💪');
  };

  const handleClosedDistraction = () => {
    const newCount = closedDistractionCount + 1;
    setClosedDistractionCount(newCount);
    
    logToData('ClosedDistraction', 'Closed distraction');
    
    setLastClickTime(new Date());
    
    alert('Great job! You\'re building strong focus habits! 🎯');
  };

  const handleFlowState = () => {
    const newCount = flowStateCount + 1;
    setFlowStateCount(newCount);
    
    const reason = flowReasonText.trim() || 'In flow state';
    logToData('FlowState', reason);
    
    setLastClickTime(new Date());
    setFlowReasonText('');
    
    alert('Awesome! You\'re crushing it! Keep up the great work! 🚀');
  };

  const handleBreak = () => {
    logToData('Break', 'Took a break');
    setLastBreakTime(new Date());
    
    alert('Great! Taking breaks is important for productivity.');
  };

  const downloadCSV = () => {
    const headers = 'Timestamp,Event,DistractionCount,ClosedDistractionCount,FlowStateCount,TimeSinceLastClick(minutes),TimeSinceLastBreak(minutes),Reason';
    const csvContent = [
      headers,
      ...sessionData.map(row => 
        `${row.timestamp},${row.event},${row.distractionCount},${row.closedDistractionCount},${row.flowStateCount},${row.timeSinceLastClick},${row.timeSinceLastBreak},"${row.reason}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DistractionTracker.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const successRate = closedDistractionCount > 0 ? 
    (closedDistractionCount * 100.0 / (distractionCount + closedDistractionCount)).toFixed(1) : '0.0';
  
  const flowRate = (flowStateCount + closedDistractionCount) > 0 ? 
    ((flowStateCount + closedDistractionCount) * 100.0 / (distractionCount + closedDistractionCount + flowStateCount)).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Distraction Tracker</h1>
        
        {/* Counters */}
        <div className="text-center mb-6">
          <div className="text-lg font-bold mb-1">Distractions: {distractionCount}</div>
          <div className="text-md font-bold text-green-600 mb-1">Closed: {closedDistractionCount}</div>
          <div className="text-md font-bold text-purple-600">Flow States: {flowStateCount}</div>
        </div>

        {/* Distraction Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why do you want to get distracted?
          </label>
          <input
            type="text"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="e.g., bored, stressed, avoiding difficult task..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
          />
          <button
            onClick={handleDistraction}
            className="w-full bg-red-300 hover:bg-red-400 text-gray-800 font-medium py-3 px-4 rounded-md transition-colors"
          >
            I Want to Open a Distraction
          </button>
        </div>

        <button
          onClick={handleClosedDistraction}
          className="w-full bg-green-300 hover:bg-green-400 text-gray-800 font-medium py-3 px-4 rounded-md mb-6 transition-colors"
        >
          I Closed a Distraction
        </button>

        {/* Flow State Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's helping you stay focused?
          </label>
          <input
            type="text"
            value={flowReasonText}
            onChange={(e) => setFlowReasonText(e.target.value)}
            placeholder="e.g., ate the frog, organized tasks, clear directions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
          />
          <button
            onClick={handleFlowState}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            I'm in Flow State / Doing Great!
          </button>
        </div>

        {/* Timer Info */}
        <div className="mb-6 text-sm">
          <div className="mb-1">Time since last click: {timeSinceClick}</div>
          <div className={`mb-3 ${breakNeedsBold ? 'text-green-600 font-bold' : ''}`}>
            Time since last break: {timeSinceBreak}
          </div>
          <button
            onClick={handleBreak}
            className="bg-blue-300 hover:bg-blue-400 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            I Took a Break
          </button>
        </div>

        {/* Stats and Download */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-4">
            <div>Success Rate: {successRate}%</div>
            <div>Flow Rate: {flowRate}%</div>
            <div>Total Entries: {sessionData.length}</div>
          </div>
          
          <button
            onClick={downloadCSV}
            disabled={sessionData.length === 0}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              sessionData.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Download Data (CSV)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistractionTracker;