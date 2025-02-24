import React, { useState, useEffect, useRef } from 'react';

const ImplementationGanttChart = () => {
  // State for user inputs
  const [employeeCount, setEmployeeCount] = useState(50);
  const [selectedProducts, setSelectedProducts] = useState({
    coreProduct: true,
    advancedReporting: false,
    integrations: false,
    customWorkflows: false,
    training: true
  });

  // Available products
  const productOptions = [
    { id: 'coreProduct', label: 'Core Product', baseWeeks: 4 },
    { id: 'advancedReporting', label: 'Advanced Reporting', baseWeeks: 2 },
    { id: 'integrations', label: 'Third-party Integrations', baseWeeks: 3 },
    { id: 'customWorkflows', label: 'Custom Workflows', baseWeeks: 3 },
    { id: 'training', label: 'Training & Onboarding', baseWeeks: 2 }
  ];

  // Calculate implementation phases based on inputs
  const [implementationPlan, setImplementationPlan] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);

  // Employee size categories
  const getOrgSizeMultiplier = (count) => {
    if (count < 25) return 0.75;       // Small organization
    if (count < 100) return 1;         // Medium organization
    if (count < 500) return 1.5;       // Large organization
    return 2;                          // Enterprise
  };

  const getOrgSizeLabel = (count) => {
    if (count < 25) return 'Small';
    if (count < 100) return 'Medium';
    if (count < 500) return 'Large';
    return 'Enterprise';
  };

  useEffect(() => {
    // Generate implementation plan based on inputs
    const multiplier = getOrgSizeMultiplier(employeeCount);
    let startWeek = 0;
    let plan = [];
    
    // Planning phase (always included)
    const planningDuration = Math.round(2 * multiplier);
    plan.push({
      phase: 'Planning & Requirements',
      start: 0,
      duration: planningDuration,
      color: '#4285F4'
    });
    startWeek += planningDuration;
    
    // Add selected product implementations
    productOptions.forEach(product => {
      if (selectedProducts[product.id]) {
        const duration = Math.round(product.baseWeeks * multiplier);
        
        // Some products can be implemented in parallel
        let actualStart = startWeek;
        if (product.id === 'training') {
          // Training starts after core product is 50% complete
          const coreProduct = plan.find(p => p.phase.includes('Core Product'));
          if (coreProduct) {
            actualStart = coreProduct.start + Math.floor(coreProduct.duration / 2);
          }
        }
        
        plan.push({
          phase: product.label,
          start: actualStart,
          duration: duration,
          color: getColorForProduct(product.id)
        });
        
        // Only increment the startWeek for sequential products
        if (product.id !== 'training') {
          startWeek += duration;
        }
      }
    });
    
    // Add final deployment phase
    const deploymentDuration = Math.round(2 * multiplier);
    plan.push({
      phase: 'Deployment & Go-Live',
      start: startWeek,
      duration: deploymentDuration,
      color: '#34A853'
    });
    
    // Calculate total duration (considering parallel tasks)
    const maxEnd = plan.reduce((max, phase) => {
      return Math.max(max, phase.start + phase.duration);
    }, 0);
    
    setImplementationPlan(plan);
    setTotalDuration(maxEnd);
  }, [employeeCount, selectedProducts]);
  
  // Helper function to get color for product
  const getColorForProduct = (productId) => {
    const colors = {
      coreProduct: '#DB4437',
      advancedReporting: '#F4B400',
      integrations: '#0F9D58',
      customWorkflows: '#4285F4',
      training: '#AA46BC'
    };
    return colors[productId] || '#888888';
  };

  // Handle product selection
  const handleProductToggle = (productId) => {
    setSelectedProducts({
      ...selectedProducts,
      [productId]: !selectedProducts[productId]
    });
  };

  // Format weeks as months and weeks
  const formatDuration = (weeks) => {
    const months = Math.floor(weeks / 4);
    const remainingWeeks = weeks % 4;
    
    if (months === 0) return `${weeks} weeks`;
    if (remainingWeeks === 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${months} month${months > 1 ? 's' : ''} ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`;
  };

  // Reference for the printable area
  const printRef = useRef();
  
  // Function to handle printing/saving as PDF
  const handlePrint = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = printRef.current.innerHTML;
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { padding: 20px; font-family: Arial, sans-serif; }
        .no-print { display: none !important; }
        .print-container { padding: 15px; }
      }
    `;
    printContent.appendChild(style);
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Implementation Plan</title></head><body>');
    printWindow.document.write('<h1>Software Implementation Plan</h1>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 500);
    }, 500);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Software Implementation Planner</h2>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 no-print"
        >
          Export as PDF
        </button>
      </div>
      
      {/* Input controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md no-print">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Size: {employeeCount} employees ({getOrgSizeLabel(employeeCount)})
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10</span>
            <span>250</span>
            <span>500</span>
            <span>1000</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Mix:
          </label>
          <div className="space-y-2">
            {productOptions.map(product => (
              <div key={product.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={product.id}
                  checked={selectedProducts[product.id]}
                  onChange={() => handleProductToggle(product.id)}
                  className="mr-2"
                  disabled={product.id === 'coreProduct'} // Core product always required
                />
                <label htmlFor={product.id} className="text-sm">
                  {product.label} ({product.baseWeeks} weeks base)
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Printable area starts */}
      <div ref={printRef} className="print-container">
      
      {/* Implementation summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <h3 className="text-md font-semibold">Implementation Summary</h3>
        <p className="text-sm">
          Estimated duration: <strong>{formatDuration(totalDuration)}</strong>
        </p>
        <p className="text-sm">
          Complexity factor: <strong>{getOrgSizeMultiplier(employeeCount)}x</strong> (based on organization size)
        </p>
      </div>
      
      {/* Gantt Chart */}
      <div className="mb-6 overflow-x-auto">
        <div className="min-w-full">
          {/* Week header */}
          <div className="flex border-b border-gray-200 mb-2">
            <div className="w-1/4 flex-shrink-0"></div>
            <div className="flex-grow flex">
              {Array.from({ length: totalDuration + 1 }).map((_, i) => (
                <div key={i} className="w-8 flex-shrink-0 text-center text-xs">
                  {i}
                </div>
              ))}
            </div>
          </div>
          
          {/* Gantt bars */}
          {implementationPlan.map((phase, index) => (
            <div key={index} className="flex items-center mb-3">
              <div className="w-1/4 flex-shrink-0 pr-2 text-sm font-medium">
                {phase.phase}
              </div>
              <div className="flex-grow flex relative h-6">
                <div
                  className="absolute rounded-md"
                  style={{
                    left: `${phase.start * 2}rem`,
                    width: `${phase.duration * 2}rem`,
                    height: '100%',
                    backgroundColor: phase.color
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    {phase.duration}w
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium mb-2">Legend</h3>
        <div className="flex flex-wrap gap-3">
          {productOptions.map(product => (
            <div key={product.id} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: getColorForProduct(product.id) }}
              ></div>
              <span className="text-xs">{product.label}</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1 bg-blue-500"></div>
            <span className="text-xs">Planning</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-1 bg-green-500"></div>
            <span className="text-xs">Deployment</span>
          </div>
        </div>
      </div>
      
      </div> {/* End of printable area */}
    </div>
  );
};

export default ImplementationGanttChart;
