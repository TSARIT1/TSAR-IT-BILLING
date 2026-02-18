import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import "../dashboard.css";
import "../staffAttendance.css";
import { FiUsers, FiCalendar, FiDollarSign, FiClock } from "react-icons/fi";
import "bootstrap-icons/font/bootstrap-icons.css";
import jsPDF from "jspdf";
import {
  createStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
  markAttendancePresent,
  unmarkAttendancePresent,
  markAttendanceAbsent,
  unmarkAttendanceAbsent,
  getMonthlyAttendance,
  getBusinessSettings,
  getBusinessDetails
} from "../../services/api";
import autoTable from "jspdf-autotable";

function StaffAttendance() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    mobileNumber: '',
    role: '',
    salaryPayoutType: 'Monthly',
    salary: '',
    salaryCycle: '1 to 1 Every month',
    openingBalance: '0',
    balanceType: 'To Pay'
  });

  // Attendance State
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [attendance, setAttendance] = useState({}); // Format: { 'STAFF123-2024-01-15': 'Present' }

  // View Attendance Modal State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [staffMonthlyAttendance, setStaffMonthlyAttendance] = useState([]); // Present days
  const [staffMonthlyAbsentDays, setStaffMonthlyAbsentDays] = useState([]); // Absent days

  // Load staff on component mount
  useEffect(() => {
    loadStaff();
  }, []);

  // Load staff from backend
  const loadStaff = async () => {
    try {
      const businessId = localStorage.getItem('userBusinessId');
      if (!businessId) {
        console.error('Business ID not found');
        return;
      }

      const staff = await getAllStaff(businessId, 'ACTIVE');
      setStaffList(staff);

      // Load attendance for current month after loading staff
      if (staff.length > 0) {
        await loadMonthlyAttendance(staff);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  // Export Staff Report PDF
  const generateStaffReportPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Fetch Business Details
      const businessId = localStorage.getItem("businessId");
      let business = {};
      try {
        if (businessId) {
          business = await getBusinessDetails(businessId);
        }
      } catch (error) {
        console.error("Error fetching business details:", error);
      }

      // Add Border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(5, 5, pageWidth - 10, doc.internal.pageSize.height - 10);

      let yPos = 20;

      // --- Business Header ---
      // Logo (if available)
      if (business.businessLogo) {
        try {
          doc.addImage(business.businessLogo, 'JPEG', 15, 15, 25, 25);
        } catch (e) {
          console.warn("Could not add logo", e);
        }
      }

      // Business Info
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(62, 78, 150); // Primary Color
      doc.text(business.businessName || "My Business", pageWidth / 2, yPos, { align: 'center' });

      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(business.address || "", pageWidth / 2, yPos, { align: 'center' });

      yPos += 5;
      doc.text(`Email: ${business.email || ""} | Contact: ${business.mobileNumber || ""}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 5;
      if (business.gstin) {
        doc.text(`GSTIN: ${business.gstin}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }

      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(10, yPos, pageWidth - 10, yPos);

      yPos += 10;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(62, 78, 150);
      doc.text("Staff Members Report", 14, yPos);

      yPos += 5;

      // --- Staff Table ---
      const tableColumn = ["Sr No", "Staff ID", "Name", "Contact", "Role", "Sec. Deposit", "Total Salary"];
      const tableRows = [];

      staffList.forEach((staff, index) => {
        const securityDeposit = staff.balanceType === 'TO_RECEIVE' ? staff.openingBalance : 0;
        const staffData = [
          index + 1,
          staff.id || "-",
          staff.name,
          staff.mobileNumber,
          staff.role,
          `Rs. ${parseFloat(securityDeposit).toLocaleString()}`,
          `Rs. ${parseFloat(staff.salary).toLocaleString()}`
        ];
        tableRows.push(staffData);
      });

      autoTable(doc, {
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [62, 78, 150],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [245, 247, 255]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 25 },
          5: { halign: 'right' },
          6: { halign: 'right' }
        },
        margin: { top: 20, right: 14, bottom: 20, left: 14 },
      });

      // Business Footer Signature
      const finalY = (doc.lastAutoTable?.finalY || yPos) + 30;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Authorized Signature", pageWidth - 20, finalY, { align: 'right' });
      doc.setLineWidth(0.5);
      doc.line(pageWidth - 60, finalY - 5, pageWidth - 10, finalY - 5);

      doc.save(`Staff_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF report");
    }
  };

  // Load monthly attendance for all staff
  const loadMonthlyAttendance = async (staffMembers) => {
    try {
      const businessId = localStorage.getItem('userBusinessId');
      if (!businessId) return;

      const date = new Date(selectedDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const attendanceMap = {};

      for (const staff of staffMembers) {
        try {
          const monthlyData = await getMonthlyAttendance(staff.id, month, year, businessId);

          // Convert monthly data to our local format
          if (monthlyData && monthlyData.presentDays) {
            monthlyData.presentDays.forEach(day => {
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const key = `${staff.id}-${dateStr}`;
              attendanceMap[key] = 'Present';
            });
          }

          // Load absent days
          if (monthlyData && monthlyData.absentDays) {
            monthlyData.absentDays.forEach(day => {
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const key = `${staff.id}-${dateStr}`;
              attendanceMap[key] = 'Absent';
            });
          }
        } catch (error) {
          // If no record exists for this month, that's okay
          console.log(`No attendance record for staff ${staff.id} in ${month}/${year}`);
        }
      }

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error loading monthly attendance:', error);
    }
  };

  // Reload attendance when date changes
  useEffect(() => {
    if (staffList.length > 0) {
      loadMonthlyAttendance(staffList);
    }
  }, [selectedDate]);

  // Handle attendance marking
  const handleAttendanceChange = async (staffId, status) => {
    const key = `${staffId}-${selectedDate}`;
    const currentStatus = attendance[key];

    // Prevent changing from Present to Absent or vice versa
    if (currentStatus && currentStatus !== status) {
      alert(`Attendance already marked as "${currentStatus}" for this date. Cannot change to "${status}".`);
      return;
    }

    // If already marked with same status, ask for confirmation to unmark
    if (currentStatus === status) {
      const confirmUnmark = window.confirm(
        `Attendance is already marked as "${currentStatus}". Do you want to unmark it?`
      );
      if (!confirmUnmark) {
        return; // User cancelled, don't unmark
      }
    }

    try {
      const businessId = localStorage.getItem('userBusinessId');
      if (!businessId) {
        alert('Business ID not found. Please login again.');
        return;
      }

      if (status === 'Present') {
        if (currentStatus === 'Present') {
          // Unmark present (remove from present days)
          await unmarkAttendancePresent(staffId, selectedDate, businessId);

          // Update local state
          setAttendance(prev => {
            const newAttendance = { ...prev };
            delete newAttendance[key];
            return newAttendance;
          });
        } else {
          // Mark as present in backend
          await markAttendancePresent(staffId, selectedDate, businessId);

          // Update local state
          setAttendance(prev => ({
            ...prev,
            [key]: 'Present'
          }));
        }
      } else if (status === 'Absent') {
        if (currentStatus === 'Absent') {
          // Unmark absent (remove from absent days)
          await unmarkAttendanceAbsent(staffId, selectedDate, businessId);

          // Update local state
          setAttendance(prev => {
            const newAttendance = { ...prev };
            delete newAttendance[key];
            return newAttendance;
          });
        } else {
          // Mark as absent in backend
          await markAttendanceAbsent(staffId, selectedDate, businessId);

          // Update local state
          setAttendance(prev => ({
            ...prev,
            [key]: 'Absent'
          }));
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance: ' + (error.message || error));
    }
  };

  // Get attendance status for a staff member on selected date
  const getAttendanceStatus = (staffId) => {
    const key = `${staffId}-${selectedDate}`;
    return attendance[key] || null;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSaveStaff = async () => {
    // Validation
    if (!staffFormData.name.trim()) {
      alert('Please enter employee name');
      return;
    }
    if (!staffFormData.mobileNumber.trim()) {
      alert('Please enter mobile number');
      return;
    }
    if (!staffFormData.role.trim()) {
      alert('Please enter role');
      return;
    }
    if (!staffFormData.salary) {
      alert('Please enter salary amount');
      return;
    }

    const businessId = localStorage.getItem('userBusinessId');
    if (!businessId) {
      alert('Business ID not found. Please login again.');
      return;
    }

    try {
      // Prepare data for backend
      const staffData = {
        name: staffFormData.name,
        mobileNumber: staffFormData.mobileNumber,
        role: staffFormData.role,
        salaryPayoutType: staffFormData.salaryPayoutType.toUpperCase(), // MONTHLY, WEEKLY, DAILY
        salary: parseFloat(staffFormData.salary),
        salaryCycle: staffFormData.salaryCycle,
        openingBalance: parseFloat(staffFormData.openingBalance || 0),
        balanceType: staffFormData.balanceType === 'To Pay' ? 'TO_PAY' : 'TO_RECEIVE'
      };

      if (editingStaffId) {
        // Update existing staff
        const updatedStaff = await updateStaff(editingStaffId, staffData, businessId);
        setStaffList(prev => prev.map(staff =>
          staff.id === editingStaffId ? updatedStaff : staff
        ));
        alert('Staff member updated successfully!');
        setEditingStaffId(null);
      } else {
        // Add new staff
        const newStaff = await createStaff(staffData, businessId);
        setStaffList(prev => [...prev, newStaff]);
        alert('Staff member added successfully!');
      }

      // Reset form and close modal
      resetForm();
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member: ' + (error.message || error));
    }
  };

  // Handle edit staff
  const handleEditStaff = (staff) => {
    setStaffFormData({
      name: staff.name,
      mobileNumber: staff.mobileNumber,
      role: staff.role,
      salaryPayoutType: staff.salaryPayoutType,
      salary: staff.salary,
      salaryCycle: staff.salaryCycle,
      openingBalance: staff.openingBalance,
      balanceType: staff.balanceType
    });
    setEditingStaffId(staff.id);
    setShowAddStaffModal(true);
  };

  // Handle delete staff
  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        const businessId = localStorage.getItem('userBusinessId');
        if (!businessId) {
          alert('Business ID not found. Please login again.');
          return;
        }

        await deleteStaff(staffId, businessId);
        setStaffList(prev => prev.filter(staff => staff.id !== staffId));
        alert('Staff member deleted successfully!');
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to delete staff member: ' + (error.message || error));
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setStaffFormData({
      name: '',
      mobileNumber: '',
      role: '',
      salaryPayoutType: 'Monthly',
      salary: '',
      salaryCycle: '1 to 1 Every month',
      openingBalance: '0',
      balanceType: 'To Pay'
    });
    setShowAddStaffModal(false);
    setEditingStaffId(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    resetForm();
  };

  // Handle View Attendance
  const handleViewAttendance = async (staff) => {
    setSelectedStaff(staff);
    setShowAttendanceModal(true);

    // Reset to current month
    const now = new Date();
    setCalendarMonth({ month: now.getMonth() + 1, year: now.getFullYear() });

    // Load attendance for current month
    await loadStaffMonthlyData(staff.id, now.getMonth() + 1, now.getFullYear());
  };

  // Load monthly attendance for selected staff
  const loadStaffMonthlyData = async (staffId, month, year) => {
    try {
      const businessId = localStorage.getItem('userBusinessId');
      if (!businessId) {
        console.error('Business ID not found');
        return;
      }

      console.log(`🔍 Fetching attendance for staff: ${staffId}, month: ${month}, year: ${year}`);
      const monthlyData = await getMonthlyAttendance(staffId, month, year, businessId);
      console.log('📊 Monthly data received:', monthlyData);
      console.log('✅ Present days:', monthlyData?.presentDays);
      console.log('❌ Absent days:', monthlyData?.absentDays);

      setStaffMonthlyAttendance(monthlyData?.presentDays || []);
      setStaffMonthlyAbsentDays(monthlyData?.absentDays || []);
    } catch (error) {
      console.error(`❌ Error loading attendance for ${month}/${year}:`, error);
      setStaffMonthlyAttendance([]);
      setStaffMonthlyAbsentDays([]);
    }
  };

  // Navigate calendar month
  const handlePreviousMonth = () => {
    const newMonth = calendarMonth.month === 1 ? 12 : calendarMonth.month - 1;
    const newYear = calendarMonth.month === 1 ? calendarMonth.year - 1 : calendarMonth.year;

    // Restrict navigation to not go before January 2026
    if (newYear < 2026 || (newYear === 2026 && newMonth < 1)) {
      return; // Don't allow navigation before January 2026
    }

    setCalendarMonth({ month: newMonth, year: newYear });
    if (selectedStaff) {
      loadStaffMonthlyData(selectedStaff.id, newMonth, newYear);
    }
  };

  const handleNextMonth = () => {
    const newMonth = calendarMonth.month === 12 ? 1 : calendarMonth.month + 1;
    const newYear = calendarMonth.month === 12 ? calendarMonth.year + 1 : calendarMonth.year;
    setCalendarMonth({ month: newMonth, year: newYear });
    if (selectedStaff) {
      loadStaffMonthlyData(selectedStaff.id, newMonth, newYear);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(calendarMonth.year, calendarMonth.month - 1, 1);
    const lastDay = new Date(calendarMonth.year, calendarMonth.month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  // Export Attendance PDF
  const exportAttendancePDF = () => {
    if (!selectedStaff) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [62, 78, 150]; // #3e4e96
    const accentColor = [232, 150, 27]; // #e8961b
    const greenColor = [40, 167, 69]; // #28a745
    const redColor = [220, 53, 69]; // #dc3545
    const blueColor = [0, 123, 255]; // #007bff

    // Header with gradient effect
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Report', pageWidth / 2, 15, { align: 'center' });

    // Format date as dd-mm-yyyy
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`${getMonthName(calendarMonth.month)} ${calendarMonth.year}`, pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, 32, { align: 'center' });

    // Staff Details Section
    let yPos = 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Staff Details', 20, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${selectedStaff.name}`, 20, yPos);
    yPos += 7;
    doc.text(`Role: ${selectedStaff.role}`, 20, yPos);
    yPos += 7;
    doc.text(`Contact: ${selectedStaff.mobileNumber}`, 20, yPos);

    // Attendance Summary
    yPos += 15;
    doc.setFillColor(248, 249, 250);
    doc.rect(20, yPos - 5, pageWidth - 40, 25, 'F');

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Summary', 25, yPos + 3);

    const totalDays = new Date(calendarMonth.year, calendarMonth.month, 0).getDate();
    const presentDays = staffMonthlyAttendance.length;
    const absentDays = totalDays - presentDays;

    doc.setFont(undefined, 'normal');
    doc.text(`Present Days: ${presentDays}`, 25, yPos + 12);
    doc.text(`Absent Days: ${absentDays}`, 90, yPos + 12);
    doc.text(`Total Days: ${totalDays}`, 155, yPos + 12);

    // Calendar Grid
    yPos += 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Attendance Calendar', 20, yPos);

    yPos += 10;
    const cellSize = 22;
    const startX = 20;
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Draw weekday headers
    doc.setFillColor(240, 244, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    weekdays.forEach((day, index) => {
      const x = startX + (index * cellSize);
      doc.rect(x, yPos, cellSize, 10, 'F');
      doc.setTextColor(...primaryColor);
      doc.text(day, x + cellSize / 2, yPos + 7, { align: 'center' });
    });

    yPos += 10;

    // Generate calendar days
    const days = generateCalendarDays();
    let row = 0;
    let col = 0;

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');

    // Get current date for highlighting
    const currentDate = new Date();
    const isCurrentMonth = currentDate.getMonth() + 1 === calendarMonth.month && currentDate.getFullYear() === calendarMonth.year;
    const currentDay = isCurrentMonth ? currentDate.getDate() : null;

    days.forEach((day) => {
      const x = startX + (col * cellSize);
      const y = yPos + (row * cellSize);

      if (day) {
        const isPresent = staffMonthlyAttendance.includes(day);
        const isAbsent = staffMonthlyAbsentDays.includes(day);
        const isToday = day === currentDay;

        // Draw cell with color coding
        if (isToday) {
          // Current date - blue background
          doc.setFillColor(...blueColor);
          doc.setDrawColor(...blueColor);
          doc.rect(x, y, cellSize, cellSize, 'FD');
          doc.setTextColor(255, 255, 255);
        } else if (isPresent) {
          // Present - green background
          doc.setFillColor(...greenColor);
          doc.setDrawColor(...greenColor);
          doc.rect(x, y, cellSize, cellSize, 'FD');
          doc.setTextColor(255, 255, 255);
        } else if (isAbsent) {
          // Absent - red background
          doc.setFillColor(...redColor);
          doc.setDrawColor(...redColor);
          doc.rect(x, y, cellSize, cellSize, 'FD');
          doc.setTextColor(255, 255, 255);
        } else {
          // Not marked - white with border
          doc.setDrawColor(200, 200, 200);
          doc.rect(x, y, cellSize, cellSize, 'D');
          doc.setTextColor(0, 0, 0);
        }

        // Draw day number
        doc.setFontSize(10);
        doc.text(day.toString(), x + cellSize / 2, y + cellSize / 2 + 2, { align: 'center' });
      } else {
        // Draw empty cell for days before month starts
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(245, 245, 245);
        doc.rect(x, y, cellSize, cellSize, 'FD');
      }

      col++;
      if (col === 7) {
        col = 0;
        row++;
      }
    });

    // Legend
    yPos += (row + 1) * cellSize + 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Legend:', 20, yPos);

    doc.setFont(undefined, 'normal');
    // Green - Present
    doc.setFillColor(...greenColor);
    doc.rect(45, yPos - 3, 8, 5, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('Present', 55, yPos);

    // Red - Absent
    doc.setFillColor(...redColor);
    doc.rect(90, yPos - 3, 8, 5, 'F');
    doc.text('Absent', 100, yPos);

    // Blue - Current Date
    doc.setFillColor(...blueColor);
    doc.rect(135, yPos - 3, 8, 5, 'F');
    doc.text('Today', 145, yPos);

    // Footer
    yPos = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' });

    // Save PDF
    const fileName = `${selectedStaff.name.replace(/\s+/g, '_')}_Attendance_${getMonthName(calendarMonth.month)}_${calendarMonth.year}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-content staff-attendance-page" style={{ marginTop: "2%" }}>

          {/* Enhanced Header */}
          <div className="staff-header">
            <div className="header-left">
              <h2>
                <i className="bi bi-people-fill"></i> Staff Attendance & Payroll
              </h2>
              <p className="header-subtitle">
                <i className="bi bi-info-circle"></i> Manage staff attendance and payroll efficiently
              </p>
            </div>

            <div className="header-actions">
              <button className="btn btn-outline-primary btn-sm">
                <i className="bi bi-file-earmark-bar-graph"></i> Reports
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddStaffModal(true)}
              >
                <i className="bi bi-person-plus"></i> Add Staff
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {/* Summary Cards */}
          <div className="staff-summary-cards">
            {/* 1. Total Staff */}
            <div className="summary-card blue">
              <div className="card-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="card-content">
                <h4>Total Staff</h4>
                <p className="amount">{staffList.length}</p>
                <span className="subtitle">Active Employees</span>
              </div>
            </div>

            {/* 2. Present Today (Calcul based on Selected Date) */}
            <div className="summary-card green">
              <div className="card-icon">
                <i className="bi bi-check-circle"></i>
              </div>
              <div className="card-content">
                <h4>Present {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : ''}</h4>
                <p className="amount">
                  {staffList.filter(staff => attendance[`${staff.id}-${selectedDate}`] === 'Present').length}
                </p>
                <span className="subtitle">
                  {staffList.length > 0
                    ? Math.round((staffList.filter(staff => attendance[`${staff.id}-${selectedDate}`] === 'Present').length / staffList.length) * 100)
                    : 0}% Attendance
                </span>
              </div>
            </div>

            {/* 3. Total Payroll */}
            <div className="summary-card orange">
              <div className="card-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="card-content">
                <h4>Total Payroll</h4>
                <p className="amount">
                  ₹ {staffList.reduce((sum, staff) => sum + (parseFloat(staff.salary) || 0), 0).toLocaleString()}
                </p>
                <span className="subtitle">Monthly Salary Total</span>
              </div>
            </div>

            {/* 4. Total Security Deposit */}
            <div className="summary-card purple">
              <div className="card-icon">
                <i className="bi bi-shield-lock"></i>
              </div>
              <div className="card-content">
                <h4>Total Security Deposit</h4>
                <p className="amount">
                  ₹ {staffList
                    .filter(staff => staff.balanceType === 'TO_RECEIVE')
                    .reduce((sum, staff) => sum + (parseFloat(staff.openingBalance) || 0), 0)
                    .toLocaleString()}
                </p>
                <span className="subtitle">Total Opening Balances (To Receive)</span>
              </div>
            </div>
          </div>

          {/* Staff Members Table */}
          <div className="staff-table-container">
            <div className="table-header">
              <h3>
                <i className="bi bi-people-fill"></i> Staff Members
              </h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={generateStaffReportPDF}
                  title="Download Staff Report"
                  style={{ backgroundColor: '#1af45bff', borderColor: '#dbe1c6ff' }}
                >
                  <i className="bi bi-file-earmark-pdf"></i> Export 
                </button>
                <span className="staff-count">{staffList.length} Total Staff</span>
              </div>
            </div>
            <div className="table-responsive">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Staff ID</th>
                    <th>Staff Name</th>
                    <th>Contact No</th>
                    <th>Role</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length > 0 ? (
                    staffList.map((staff, index) => (
                      <tr key={staff.id}>
                        <td>{index + 1}</td>
                        <td className="staff-id">{staff.id}</td>
                        <td className="staff-name">
                          <i className="bi bi-person-circle"></i> {staff.name}
                        </td>
                        <td>{staff.mobileNumber}</td>
                        <td>
                          <span className="role-badge">{staff.role}</span>
                        </td>
                        <td className="salary-cell">₹ {parseFloat(staff.salary).toLocaleString()}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleEditStaff(staff)}
                            title="Edit Staff"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteStaff(staff.id)}
                            title="Delete Staff"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data-cell">
                        <div className="no-data-message">
                          <i className="bi bi-inbox"></i>
                          <span>No members found</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>



          {/* Attendance Marking Table */}
          <div className="attendance-table-container">
            <div className="table-header">
              <h3>
                <i className="bi bi-calendar-check"></i> Mark Attendance
              </h3>
              <div className="attendance-header-controls">
                <div className="date-selector">
                  <label>
                    <i className="bi bi-calendar3"></i> Select Date:
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-selector">
                  <label>
                    <i className="bi bi-calendar-month"></i> Select Month:
                  </label>
                  <input
                    type="month"
                    className="form-control"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th>Contact No</th>
                    <th>Status</th>
                    <th>Mark Attendance</th>
                    <th>View Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.length > 0 ? (
                    staffList.map((staff, index) => {
                      const status = getAttendanceStatus(staff.id);
                      return (
                        <tr key={staff.id}>
                          <td>{index + 1}</td>
                          <td className="staff-name">
                            <i className="bi bi-person-circle"></i> {staff.name}
                          </td>
                          <td>
                            <span className="role-badge">{staff.role}</span>
                          </td>
                          <td>{staff.mobileNumber}</td>
                          <td>
                            {status ? (
                              <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
                                {status === 'Present' && <i className="bi bi-check-circle-fill"></i>}
                                {status === 'Absent' && <i className="bi bi-x-circle-fill"></i>}
                                {status === 'Half Day' && <i className="bi bi-dash-circle-fill"></i>}
                                {status}
                              </span>
                            ) : (
                              <span className="status-badge status-unmarked">Not Marked</span>
                            )}
                          </td>
                          <td className="attendance-actions">
                            {status ? (
                              <div className="attendance-locked" title="Attendance already marked - click same button to unmark">
                                <button
                                  className={`btn-attendance btn-present ${status === 'Present' ? 'active' : 'disabled'}`}
                                  onClick={() => handleAttendanceChange(staff.id, 'Present')}
                                  disabled={status !== 'Present'}
                                >
                                  <i className="bi bi-check-circle"></i> Present
                                </button>
                                <button
                                  className={`btn-attendance btn-absent ${status === 'Absent' ? 'active' : 'disabled'}`}
                                  onClick={() => handleAttendanceChange(staff.id, 'Absent')}
                                  disabled={status !== 'Absent'}
                                >
                                  <i className="bi bi-x-circle"></i> Absent
                                </button>
                                <span className="locked-message">
                                  <i className="bi bi-info-circle-fill"></i> Marked as {status} - Click to unmark
                                </span>
                              </div>
                            ) : (
                              <>
                                <button
                                  className={`btn-attendance btn-present ${status === 'Present' ? 'active' : ''}`}
                                  onClick={() => handleAttendanceChange(staff.id, 'Present')}
                                  title="Mark Present"
                                >
                                  <i className="bi bi-check-circle"></i> Present
                                </button>
                                <button
                                  className={`btn-attendance btn-absent ${status === 'Absent' ? 'active' : ''}`}
                                  onClick={() => handleAttendanceChange(staff.id, 'Absent')}
                                  title="Mark Absent"
                                >
                                  <i className="bi bi-x-circle"></i> Absent
                                </button>
                              </>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => handleViewAttendance(staff)}
                              title="View Attendance Calendar"
                            >
                              <i className="bi bi-calendar3"></i> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data-cell">
                        <div className="no-data-message">
                          <i className="bi bi-inbox"></i>
                          <span>No staff members to mark attendance. Please add staff first.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="attendance-summary">
              <div className="summary-item">
                <i className="bi bi-check-circle-fill text-success"></i>
                <span>Present: {Object.entries(attendance).filter(([key, val]) => key.endsWith(selectedDate) && val === 'Present').length}</span>
              </div>
              <div className="summary-item">
                <i className="bi bi-x-circle-fill text-danger"></i>
                <span>Absent: {Object.entries(attendance).filter(([key, val]) => key.endsWith(selectedDate) && val === 'Absent').length}</span>
              </div>
              <div className="summary-item">
                <i className="bi bi-calendar-check text-primary"></i>
                <span>Total Staff: {staffList.length}</span>
              </div>
            </div>
          </div>


          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper blue">
                <i className="bi bi-calendar-check"></i>
              </div>
              <h3>Digital Attendance</h3>
              <p>Mark your staff's attendance digitally with ease and accuracy</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Daily attendance tracking</li>
                <li><i className="bi bi-check2"></i> Automatic calculations</li>
                <li><i className="bi bi-check2"></i> Attendance history</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper orange">
                <i className="bi bi-cash-coin"></i>
              </div>
              <h3>Payroll Management</h3>
              <p>Simplify payroll by adding salary, advance & pending payments</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Salary calculations</li>
                <li><i className="bi bi-check2"></i> Advance payments</li>
                <li><i className="bi bi-check2"></i> Payment tracking</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper green">
                <i className="bi bi-bell"></i>
              </div>
              <h3>Smart Reminders</h3>
              <p>Set custom reminders to mark attendance timely and never miss</p>
              <ul className="feature-list">
                <li><i className="bi bi-check2"></i> Custom notifications</li>
                <li><i className="bi bi-check2"></i> Daily reminders</li>
                <li><i className="bi bi-check2"></i> Email alerts</li>
              </ul>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <div className="cta-content">
              <div className="cta-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <div className="cta-text">
                <h3>Mark attendance and manage payroll</h3>
                <p>Add staff to mark attendance and manage payroll with ease!</p>
              </div>
            </div>
            <button
              className="btn btn-lg btn-primary cta-button"
              onClick={() => setShowAddStaffModal(true)}
            >
              <i className="bi bi-person-plus-fill"></i> Add Your First Staff Member
            </button>
          </div>

          {/* Add Staff Modal */}
          {showAddStaffModal && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5>{editingStaffId ? 'Edit Staff' : 'Add Staff'}</h5>
                  <button className="close-btn" onClick={handleCloseModal}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name*</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter Employee Name"
                        value={staffFormData.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Mobile Number*</label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        className="form-control"
                        placeholder="+91  9999999999"
                        value={staffFormData.mobileNumber}
                        onChange={handleInputChange}
                        maxLength="10"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Role*</label>
                      <input
                        type="text"
                        name="role"
                        className="form-control"
                        placeholder="e.g., Manager, Cashier, Sales Executive"
                        value={staffFormData.role}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Salary Payout Type*</label>
                      <select
                        name="salaryPayoutType"
                        className="form-control"
                        value={staffFormData.salaryPayoutType}
                        onChange={handleInputChange}
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Daily">Daily</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Salary*</label>
                      <input
                        type="number"
                        name="salary"
                        className="form-control"
                        placeholder="₹ 20000"
                        value={staffFormData.salary}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Salary Cycle</label>
                      <select
                        name="salaryCycle"
                        className="form-control"
                        value={staffFormData.salaryCycle}
                        onChange={handleInputChange}
                      >
                        <option value="1 to 1 Every month">1 to 1 Every month</option>
                        <option value="1 to 15 Every month">1 to 15 Every month</option>
                        <option value="16 to 30 Every month">16 to 30 Every month</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Outstanding/Opening Balance
                        <i className="bi bi-info-circle" style={{ marginLeft: '5px', fontSize: '12px' }}></i>
                      </label>
                      <div className="balance-input-group">
                        <input
                          type="number"
                          name="openingBalance"
                          className="form-control balance-input"
                          placeholder="₹ 0"
                          value={staffFormData.openingBalance}
                          onChange={handleInputChange}
                          min="0"
                        />
                        <select
                          name="balanceType"
                          className="form-control balance-select"
                          value={staffFormData.balanceType}
                          onChange={handleInputChange}
                        >
                          <option value="To Pay">To Pay</option>
                          <option value="To Receive">To Receive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveStaff}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Attendance Calendar Modal */}
          {showAttendanceModal && selectedStaff && (
            <div className="modal-overlay" onClick={() => setShowAttendanceModal(false)}>
              <div className="modal-content attendance-calendar-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h5>
                    <i className="bi bi-calendar-check"></i> Attendance Calendar - {selectedStaff.name}
                  </h5>
                  <div className="modal-header-actions">
                    <button className="btn btn-sm btn-success" onClick={exportAttendancePDF} title="Export PDF">
                      <i className="bi bi-file-earmark-pdf"></i> Export PDF
                    </button>
                    <button className="close-btn" onClick={() => setShowAttendanceModal(false)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>

                <div className="modal-body">
                  {/* Month Navigation */}
                  <div className="calendar-header">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={handlePreviousMonth}
                      disabled={calendarMonth.year === 2026 && calendarMonth.month === 1}
                    >
                      <i className="bi bi-chevron-left"></i> Previous
                    </button>
                    <h4>{getMonthName(calendarMonth.month)} {calendarMonth.year}</h4>
                    <button className="btn btn-sm btn-outline-primary" onClick={handleNextMonth}>
                      Next <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>

                  {/* Attendance Summary */}
                  <div className="attendance-summary">
                    <div className="summary-item">
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span>Present Days: <strong>{staffMonthlyAttendance.length}</strong></span>
                    </div>
                    <div className="summary-item">
                      <i className="bi bi-calendar3"></i>
                      <span>Total Days: <strong>{new Date(calendarMonth.year, calendarMonth.month, 0).getDate()}</strong></span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="calendar-container">
                    <div className="calendar-weekdays">
                      <div className="weekday">Sun</div>
                      <div className="weekday">Mon</div>
                      <div className="weekday">Tue</div>
                      <div className="weekday">Wed</div>
                      <div className="weekday">Thu</div>
                      <div className="weekday">Fri</div>
                      <div className="weekday">Sat</div>
                    </div>
                    <div className="calendar-days">
                      {generateCalendarDays().map((day, index) => {
                        if (!day) {
                          return <div key={index} className="calendar-day empty"></div>;
                        }

                        const isPresent = staffMonthlyAttendance.includes(day);
                        const isAbsent = staffMonthlyAbsentDays.includes(day);

                        return (
                          <div
                            key={index}
                            className={`calendar-day ${isPresent ? 'present' : ''} ${isAbsent ? 'absent' : ''}`}
                          >
                            <span className="day-number">{day}</span>
                            {isPresent && <span className="present-dot"></span>}
                            {isAbsent && <span className="absent-dot"></span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="calendar-legend">
                    <div className="legend-item">
                      <span className="legend-dot present-dot"></span>
                      <span>Present</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot absent-dot"></span>
                      <span>Absent</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot"></span>
                      <span>Not Marked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div >
      </div >
    </>
  );
}

export default StaffAttendance;
