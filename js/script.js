let currentLanguage = localStorage.getItem('language') || 'ar';
let currentTheme = localStorage.getItem('theme') || 'light';

// Simple demo accounts
const demoUsers = [
    { role: 'admin', username: 'admin', password: 'admin123', name: 'المدير' },
    { role: 'teacher', username: 'teacher', password: 'teach123', name: 'معلم' },
    { role: 'student', username: 'student', password: 'stud123', name: 'طالب' }
];

// Current session
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Chart instances
let studentsChart = null;
let gradesChart = null;
let attendanceChart = null;
let subjectsChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeLanguage();
    initializeTheme();
    initializeSidebar();
    initializeCountryCodes();
    loadData();
    updateDashboard();
    bindLoginUI();
    applySessionUI();
    initializeCharts();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const gradeDate = document.getElementById('gradeDate');
    const attendanceDate = document.getElementById('attendanceDate');
    if (gradeDate) gradeDate.value = today;
    if (attendanceDate) attendanceDate.value = today;
});

// Sidebar functions
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('appContainer');
    const isSidebarOpen = localStorage.getItem('sidebarOpen') !== 'false';
    
    if (!isSidebarOpen) {
        sidebar.classList.add('closed');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('appContainer');
    const isOpen = !sidebar.classList.contains('closed');
    
    sidebar.classList.toggle('closed');
    if (appContainer) {
        appContainer.classList.toggle('sidebar-open', !isOpen);
    }
    
    localStorage.setItem('sidebarOpen', isOpen ? 'false' : 'true');
}

// Language functions
function initializeLanguage() {
    document.getElementById('languageSelector').value = currentLanguage;
    applyLanguage(currentLanguage);
}

function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    document.title = translations[lang].page_title;

    // Update demo accounts text if visible
    renderDemoAccounts();
    updateLoginHint();
    displayStudents();
    displayTeachers();
    displayGrades();
    updateDashboard();
    updateCharts();
}

// Theme functions
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    updateCharts(); // Update charts with new theme colors
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    themeToggle.title = currentTheme === 'light' ?
        (currentLanguage === 'ar' ? 'تبديل إلى الوضع الداكن' : 'Switch to Dark Mode') :
        (currentLanguage === 'ar' ? 'تبديل إلى الوضع الفاتح' : 'Switch to Light Mode');
}

// Event listeners
document.getElementById('languageSelector').addEventListener('change', function () {
    applyLanguage(this.value);
});
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('sidebarToggler').addEventListener('click', toggleSidebar);

// Data storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let teachers = JSON.parse(localStorage.getItem('teachers')) || [];
let grades = JSON.parse(localStorage.getItem('grades')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];

// Country codes for phone numbers
const countryCodes = [
    { code: '+966', country: 'السعودية / Saudi Arabia' },
    { code: '+971', country: 'الإمارات / UAE' },
    { code: '+965', country: 'الكويت / Kuwait' },
    { code: '+974', country: 'قطر / Qatar' },
    { code: '+973', country: 'البحرين / Bahrain' },
    { code: '+968', country: 'عمان / Oman' },
    { code: '+962', country: 'الأردن / Jordan' },
    { code: '+961', country: 'لبنان / Lebanon' },
    { code: '+963', country: 'سوريا / Syria' },
    { code: '+964', country: 'العراق / Iraq' },
    { code: '+20', country: 'مصر / Egypt' },
    { code: '+212', country: 'المغرب / Morocco' },
    { code: '+213', country: 'الجزائر / Algeria' },
    { code: '+216', country: 'تونس / Tunisia' },
    { code: '+218', country: 'ليبيا / Libya' },
    { code: '+249', country: 'السودان / Sudan' },
    { code: '+1', country: 'الولايات المتحدة / USA' },
    { code: '+44', country: 'المملكة المتحدة / UK' },
    { code: '+33', country: 'فرنسا / France' },
    { code: '+49', country: 'ألمانيا / Germany' }
];

function initializeCountryCodes() {
    const studentCountryCode = document.getElementById('studentCountryCode');
    const teacherCountryCode = document.getElementById('teacherCountryCode');

    if (studentCountryCode) {
        countryCodes.forEach(country => {
            const option1 = document.createElement('option');
            option1.value = country.code;
            option1.textContent = `${country.code} ${country.country}`;
            studentCountryCode.appendChild(option1);
        });
        studentCountryCode.value = '+966';
    }
    if (teacherCountryCode) {
        countryCodes.forEach(country => {
            const option2 = document.createElement('option');
            option2.value = country.code;
            option2.textContent = `${country.code} ${country.country}`;
            teacherCountryCode.appendChild(option2);
        });
        teacherCountryCode.value = '+966';
    }
}

// Chart initialization and management
function initializeCharts() {
    initializeStudentsChart();
    initializeGradesChart();
    initializeAttendanceChart();
    initializeSubjectsChart();
}

function getChartColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        primary: style.getPropertyValue('--chart-primary').trim(),
        secondary: style.getPropertyValue('--chart-secondary').trim(),
        accent: style.getPropertyValue('--chart-accent').trim(),
        danger: style.getPropertyValue('--chart-danger').trim(),
        info: style.getPropertyValue('--chart-info').trim(),
        purple: style.getPropertyValue('--chart-purple').trim(),
        orange: style.getPropertyValue('--chart-orange').trim(),
        pink: style.getPropertyValue('--chart-pink').trim(),
        textColor: style.getPropertyValue('--text-color').trim(),
        backgroundColor: style.getPropertyValue('--card-background').trim()
    };
}

function initializeStudentsChart() {
    const ctx = document.getElementById('studentsChart');
    if (!ctx) return;

    const colors = getChartColors();
    const data = getStudentsByClassData();

    studentsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    colors.primary,
                    colors.secondary,
                    colors.accent,
                    colors.danger,
                    colors.info,
                    colors.purple
                ],
                borderWidth: 2,
                borderColor: colors.backgroundColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI',
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: colors.backgroundColor,
                    titleColor: colors.textColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.primary,
                    borderWidth: 1
                }
            }
        }
    });
}

function initializeGradesChart() {
    const ctx = document.getElementById('gradesChart');
    if (!ctx) return;

    const colors = getChartColors();
    const data = getGradesDistributionData();

    gradesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: currentLanguage === 'ar' ? 'عدد الطلاب' : 'Number of Students',
                data: data.values,
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: colors.backgroundColor,
                    titleColor: colors.textColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.primary,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                },
                x: {
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                }
            }
        }
    });
}

function initializeAttendanceChart() {
    const ctx = document.getElementById('attendanceChart');
    if (!ctx) return;

    const colors = getChartColors();
    const data = getAttendanceTrendData();

    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: currentLanguage === 'ar' ? 'معدل الحضور %' : 'Attendance Rate %',
                data: data.values,
                borderColor: colors.secondary,
                backgroundColor: colors.secondary + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors.secondary,
                pointBorderColor: colors.backgroundColor,
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: colors.backgroundColor,
                    titleColor: colors.textColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.secondary,
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                },
                x: {
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                }
            }
        }
    });
}

function initializeSubjectsChart() {
    const ctx = document.getElementById('subjectsChart');
    if (!ctx) return;

    const colors = getChartColors();
    const data = getTopSubjectsData();

    subjectsChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: data.labels,
            datasets: [{
                label: currentLanguage === 'ar' ? 'متوسط الدرجات' : 'Average Grade',
                data: data.values,
                backgroundColor: [
                    colors.accent,
                    colors.info,
                    colors.purple,
                    colors.orange,
                    colors.pink
                ],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: colors.backgroundColor,
                    titleColor: colors.textColor,
                    bodyColor: colors.textColor,
                    borderColor: colors.accent,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                },
                y: {
                    ticks: {
                        color: colors.textColor,
                        font: {
                            family: currentLanguage === 'ar' ? 'Segoe UI' : 'Segoe UI'
                        }
                    },
                    grid: {
                        color: colors.textColor + '20'
                    }
                }
            }
        }
    });
}

// Chart data functions
function getStudentsByClassData() {
    const classCounts = {};
    const classNames = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
    
    classNames.forEach(className => {
        classCounts[className] = 0;
    });
    
    students.forEach(student => {
        if (classCounts.hasOwnProperty(student.class)) {
            classCounts[student.class]++;
        }
    });
    
    const labels = classNames.map(className => 
        currentLanguage === 'ar' ? className : getEnglishGradeName(className)
    );
    
    return {
        labels: labels,
        values: Object.values(classCounts)
    };
}

function getGradesDistributionData() {
    const gradeRanges = {
        'ممتاز (90-100)': 0,
        'جيد جداً (80-89)': 0,
        'جيد (70-79)': 0,
        'مقبول (60-69)': 0,
        'ضعيف (أقل من 60)': 0
    };
    
    const selectedClass = document.getElementById('gradesChartFilter')?.value || 'all';
    
    grades.forEach(grade => {
        if (selectedClass !== 'all') {
            const student = students.find(s => s.id === grade.studentId);
            if (!student || student.class !== selectedClass) return;
        }
        
        const value = parseFloat(grade.grade);
        if (value >= 90) gradeRanges['ممتاز (90-100)']++;
        else if (value >= 80) gradeRanges['جيد جداً (80-89)']++;
        else if (value >= 70) gradeRanges['جيد (70-79)']++;
        else if (value >= 60) gradeRanges['مقبول (60-69)']++;
        else gradeRanges['ضعيف (أقل من 60)']++;
    });
    
    const labels = Object.keys(gradeRanges).map(range => 
        currentLanguage === 'ar' ? range : getEnglishGradeRange(range)
    );
    
    return {
        labels: labels,
        values: Object.values(gradeRanges)
    };
}

function getAttendanceTrendData() {
    const period = parseInt(document.getElementById('attendanceChartPeriod')?.value || '30');
    const dates = [];
    const attendanceRates = [];
    
    const today = new Date();
    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayAttendance = attendance.filter(a => a.date === dateStr);
        const totalStudents = students.length;
        const presentStudents = dayAttendance.filter(a => a.status === 'present').length;
        
        const rate = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0;
        
        dates.push(formatDateForChart(date));
        attendanceRates.push(rate);
    }
    
    return {
        labels: dates,
        values: attendanceRates
    };
}

function getTopSubjectsData() {
    const subjectGrades = {};
    
    grades.forEach(grade => {
        if (!subjectGrades[grade.subject]) {
            subjectGrades[grade.subject] = [];
        }
        subjectGrades[grade.subject].push(parseFloat(grade.grade));
    });
    
    const subjectAverages = Object.keys(subjectGrades).map(subject => ({
        subject: subject,
        average: subjectGrades[subject].reduce((a, b) => a + b, 0) / subjectGrades[subject].length
    }));
    
    subjectAverages.sort((a, b) => b.average - a.average);
    const topSubjects = subjectAverages.slice(0, 5);
    
    return {
        labels: topSubjects.map(s => s.subject),
        values: topSubjects.map(s => Math.round(s.average))
    };
}

// Chart update functions
function updateCharts() {
    if (studentsChart) {
        studentsChart.destroy();
        initializeStudentsChart();
    }
    if (gradesChart) {
        gradesChart.destroy();
        initializeGradesChart();
    }
    if (attendanceChart) {
        attendanceChart.destroy();
        initializeAttendanceChart();
    }
    if (subjectsChart) {
        subjectsChart.destroy();
        initializeSubjectsChart();
    }
}

function refreshChart(chartName) {
    switch(chartName) {
        case 'studentsChart':
            if (studentsChart) {
                studentsChart.destroy();
                initializeStudentsChart();
            }
            break;
        case 'gradesChart':
            updateGradesChart();
            break;
        case 'attendanceChart':
            updateAttendanceChart();
            break;
        case 'subjectsChart':
            if (subjectsChart) {
                subjectsChart.destroy();
                initializeSubjectsChart();
            }
            break;
    }
}

function updateGradesChart() {
    if (gradesChart) {
        gradesChart.destroy();
        initializeGradesChart();
    }
}

function updateAttendanceChart() {
    if (attendanceChart) {
        attendanceChart.destroy();
        initializeAttendanceChart();
    }
}

// Helper functions
function getEnglishGradeName(arabicName) {
    const gradeMap = {
        'الأول': 'First',
        'الثاني': 'Second',
        'الثالث': 'Third',
        'الرابع': 'Fourth',
        'الخامس': 'Fifth',
        'السادس': 'Sixth'
    };
    return gradeMap[arabicName] || arabicName;
}

function getEnglishGradeRange(arabicRange) {
    const rangeMap = {
        'ممتاز (90-100)': 'Excellent (90-100)',
        'جيد جداً (80-89)': 'Very Good (80-89)',
        'جيد (70-79)': 'Good (70-79)',
        'مقبول (60-69)': 'Acceptable (60-69)',
        'ضعيف (أقل من 60)': 'Poor (< 60)'
    };
    return rangeMap[arabicRange] || arabicRange;
}

function formatDateForChart(date) {
    if (currentLanguage === 'ar') {
        return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Validation functions
function validateName(name) { return name.trim().length >= 2; }
function validateAge(age) { return age >= 5 && age <= 25; }
function validatePhone(phone) { return /^[0-9]{8,15}$/.test(phone.replace(/\s/g, '')); }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validateGrade(grade) { return grade >= 0 && grade <= 100; }

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    if (!errorElement) return;
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    if (inputElement) inputElement.classList.add('invalid');
}

function clearAllErrors(prefix) {
    const errorElements = document.querySelectorAll(`[id^="${prefix}"][id$="Error"]`);
    errorElements.forEach(element => {
        element.style.display = 'none';
        const inputId = element.id.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) inputElement.classList.remove('invalid');
    });
}

// Alert functions
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    alertContainer.appendChild(alert);
    setTimeout(() => { alert.remove(); }, 3000);
}

// Enhanced search and filter functions
function clearStudentFilters() {
    document.getElementById('studentSearch').value = '';
    document.getElementById('studentClassFilter').value = '';
    document.getElementById('studentAgeFilter').value = '';
    displayStudents();
}

function clearTeacherFilters() {
    document.getElementById('teacherSearch').value = '';
    document.getElementById('teacherSubjectFilter').value = '';
    displayTeachers();
}

function clearGradeFilters() {
    document.getElementById('gradeSearch').value = '';
    document.getElementById('gradeStudentFilter').value = '';
    document.getElementById('gradeSubjectFilter').value = '';
    document.getElementById('gradeRangeFilter').value = '';
    displayGrades();
}

// Student management functions
function addStudent() {
    if (!isAllowed(['admin', 'teacher'])) return;
    clearAllErrors('student');

    const name = document.getElementById('studentName').value.trim();
    const age = parseInt(document.getElementById('studentAge').value);
    const studentClass = document.getElementById('studentClass').value;
    const phone = document.getElementById('studentPhone').value.trim();
    const countryCode = document.getElementById('studentCountryCode').value;

    let isValid = true;
    if (!validateName(name)) { showError('studentNameError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!validateAge(age)) { showError('studentAgeError', translations[currentLanguage].error_invalid_age); isValid = false; }
    if (!studentClass) { showError('studentClassError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!validatePhone(phone)) { showError('studentPhoneError', translations[currentLanguage].error_invalid_phone); isValid = false; }
    if (!isValid) return;

    const student = { id: Date.now(), name, age, class: studentClass, phone: `${countryCode} ${phone}` };
    students.push(student);
    saveData();
    displayStudents();
    updateDashboard();
    updateGradeStudentOptions();
    updateCharts();

    document.getElementById('studentName').value = '';
    document.getElementById('studentAge').value = '';
    document.getElementById('studentClass').value = '';
    document.getElementById('studentPhone').value = '';

    showAlert(translations[currentLanguage].success_add);
}

function displayStudents() {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;
    
    const searchTerm = (document.getElementById('studentSearch')?.value || '').toLowerCase();
    const classFilter = document.getElementById('studentClassFilter')?.value || '';
    const ageFilter = document.getElementById('studentAgeFilter')?.value || '';

    let filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            student.class.toLowerCase().includes(searchTerm);
        const matchesClass = !classFilter || student.class === classFilter;
        const matchesAge = !ageFilter || isAgeInRange(student.age, ageFilter);
        
        return matchesSearch && matchesClass && matchesAge;
    });

    // If student role, hide students tab entirely via role UI, but keep safe here
    if (currentUser?.role === 'student') {
        filteredStudents = [];
    }

    // Update results count
    const countElement = document.getElementById('studentsCount');
    if (countElement) {
        countElement.textContent = filteredStudents.length;
    }

    const canManage = isAllowed(['admin', 'teacher']);
    tbody.innerHTML = filteredStudents.map(student => `
        <tr>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.class}</td>
            <td>${student.phone}</td>
            ${canManage ? `<td>
                <button class="btn btn-small" onclick="editStudent(${student.id})">${translations[currentLanguage].edit}</button>
                <button class="btn btn-danger btn-small" onclick="deleteStudent(${student.id})">${translations[currentLanguage].delete}</button>
            </td>` : `<td class="role-hidden"></td>`}
        </tr>
    `).join('');
}

function isAgeInRange(age, range) {
    const [min, max] = range.split('-').map(Number);
    return age >= min && age <= max;
}

function editStudent(id) {
    if (!isAllowed(['admin', 'teacher'])) return;
    const student = students.find(s => s.id === id);
    if (!student) return;
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="form-group">
            <label>${translations[currentLanguage].student_name}</label>
            <input type="text" id="editStudentName" value="${student.name}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].age}</label>
            <input type="number" id="editStudentAge" value="${student.age}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].class}</label>
            <select id="editStudentClass">
                <option value="الأول" ${student.class === 'الأول' ? 'selected' : ''}>${translations[currentLanguage].first_grade}</option>
                <option value="الثاني" ${student.class === 'الثاني' ? 'selected' : ''}>${translations[currentLanguage].second_grade}</option>
                <option value="الثالث" ${student.class === 'الثالث' ? 'selected' : ''}>${translations[currentLanguage].third_grade}</option>
                <option value="الرابع" ${student.class === 'الرابع' ? 'selected' : ''}>${translations[currentLanguage].fourth_grade}</option>
                <option value="الخامس" ${student.class === 'الخامس' ? 'selected' : ''}>${translations[currentLanguage].fifth_grade}</option>
                <option value="السادس" ${student.class === 'السادس' ? 'selected' : ''}>${translations[currentLanguage].sixth_grade}</option>
            </select>
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].phone}</label>
            <input type="text" id="editStudentPhone" value="${student.phone}">
        </div>
    `;
    document.getElementById('editModal').classList.add('show');
    window.currentEditId = id;
    window.currentEditType = 'student';
}

function deleteStudent(id) {
    if (!isAllowed(['admin', 'teacher'])) return;
    if (confirm(translations[currentLanguage].confirm_delete)) {
        students = students.filter(s => s.id !== id);
        grades = grades.filter(g => g.studentId !== id);
        attendance = attendance.filter(a => a.studentId !== id);
        saveData();
        displayStudents();
        displayGrades();
        updateDashboard();
        updateGradeStudentOptions();
        updateCharts();
        showAlert(translations[currentLanguage].success_delete);
    }
}

// Teacher management functions
function addTeacher() {
    if (!isAllowed(['admin'])) return;
    clearAllErrors('teacher');

    const name = document.getElementById('teacherName').value.trim();
    const subject = document.getElementById('teacherSubject').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();
    const countryCode = document.getElementById('teacherCountryCode').value;
    const email = document.getElementById('teacherEmail').value.trim();

    let isValid = true;
    if (!validateName(name)) { showError('teacherNameError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!subject) { showError('teacherSubjectError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!validatePhone(phone)) { showError('teacherPhoneError', translations[currentLanguage].error_invalid_phone); isValid = false; }
    if (!validateEmail(email)) { showError('teacherEmailError', translations[currentLanguage].error_invalid_email); isValid = false; }
    if (!isValid) return;

    const teacher = { id: Date.now(), name, subject, phone: `${countryCode} ${phone}`, email };
    teachers.push(teacher);
    saveData();
    displayTeachers();
    updateDashboard();
    updateTeacherSubjectFilter();
    updateCharts();

    document.getElementById('teacherName').value = '';
    document.getElementById('teacherSubject').value = '';
    document.getElementById('teacherPhone').value = '';
    document.getElementById('teacherEmail').value = '';

    showAlert(translations[currentLanguage].success_add);
}

function displayTeachers() {
    const tbody = document.getElementById('teachersTableBody');
    if (!tbody) return;
    
    const searchTerm = (document.getElementById('teacherSearch')?.value || '').toLowerCase();
    const subjectFilter = document.getElementById('teacherSubjectFilter')?.value || '';

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = teacher.name.toLowerCase().includes(searchTerm) ||
                            teacher.subject.toLowerCase().includes(searchTerm);
        const matchesSubject = !subjectFilter || teacher.subject === subjectFilter;
        
        return matchesSearch && matchesSubject;
    });

    // Update results count
    const countElement = document.getElementById('teachersCount');
    if (countElement) {
        countElement.textContent = filteredTeachers.length;
    }

    const canManage = isAllowed(['admin']);
    tbody.innerHTML = filteredTeachers.map(teacher => `
        <tr>
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.phone}</td>
            <td>${teacher.email}</td>
            ${canManage ? `<td>
                <button class="btn btn-small" onclick="editTeacher(${teacher.id})">${translations[currentLanguage].edit}</button>
                <button class="btn btn-danger btn-small" onclick="deleteTeacher(${teacher.id})">${translations[currentLanguage].delete}</button>
            </td>` : `<td class="role-hidden"></td>`}
        </tr>
    `).join('');
}

function updateTeacherSubjectFilter() {
    const subjectFilter = document.getElementById('teacherSubjectFilter');
    if (!subjectFilter) return;
    
    const subjects = [...new Set(teachers.map(t => t.subject))];
    const currentValue = subjectFilter.value;
    
    subjectFilter.innerHTML = `<option value="">${translations[currentLanguage].all_subjects || 'جميع المواد'}</option>`;
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
    
    subjectFilter.value = currentValue;
}

function editTeacher(id) {
    if (!isAllowed(['admin'])) return;
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="form-group">
            <label>${translations[currentLanguage].teacher_name}</label>
            <input type="text" id="editTeacherName" value="${teacher.name}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].subject}</label>
            <input type="text" id="editTeacherSubject" value="${teacher.subject}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].phone}</label>
            <input type="text" id="editTeacherPhone" value="${teacher.phone}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].email}</label>
            <input type="email" id="editTeacherEmail" value="${teacher.email}">
        </div>
    `;
    document.getElementById('editModal').classList.add('show');
    window.currentEditId = id;
    window.currentEditType = 'teacher';
}

function deleteTeacher(id) {
    if (!isAllowed(['admin'])) return;
    if (confirm(translations[currentLanguage].confirm_delete)) {
        teachers = teachers.filter(t => t.id !== id);
        saveData();
        displayTeachers();
        updateDashboard();
        updateTeacherSubjectFilter();
        updateCharts();
        showAlert(translations[currentLanguage].success_delete);
    }
}

// Grade management functions
function addGrade() {
    if (!isAllowed(['admin', 'teacher'])) return;
    clearAllErrors('grade');

    const studentId = parseInt(document.getElementById('gradeStudent').value);
    const subject = document.getElementById('gradeSubject').value.trim();
    const gradeValue = parseFloat(document.getElementById('gradeValue').value);
    const date = document.getElementById('gradeDate').value;

    let isValid = true;
    if (!studentId) { showError('gradeStudentError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!subject) { showError('gradeSubjectError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!validateGrade(gradeValue)) { showError('gradeValueError', translations[currentLanguage].error_invalid_grade); isValid = false; }
    if (!date) { showError('gradeDateError', translations[currentLanguage].error_fill_fields); isValid = false; }
    if (!isValid) return;

    const grade = { id: Date.now(), studentId, subject, grade: gradeValue, date };
    grades.push(grade);
    saveData();
    displayGrades();
    updateDashboard();
    updateGradeFilters();
    updateCharts();

    document.getElementById('gradeStudent').value = '';
    document.getElementById('gradeSubject').value = '';
    document.getElementById('gradeValue').value = '';

    showAlert(translations[currentLanguage].success_add);
}

function displayGrades() {
    const tbody = document.getElementById('gradesTableBody');
    if (!tbody) return;
    
    const searchTerm = (document.getElementById('gradeSearch')?.value || '').toLowerCase();
    const studentFilter = document.getElementById('gradeStudentFilter')?.value || '';
    const subjectFilter = document.getElementById('gradeSubjectFilter')?.value || '';
    const rangeFilter = document.getElementById('gradeRangeFilter')?.value || '';

    let filteredGrades = grades.filter(grade => {
        const student = students.find(s => s.id === grade.studentId);
        if (!student) return false;
        
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
                            grade.subject.toLowerCase().includes(searchTerm);
        const matchesStudent = !studentFilter || grade.studentId.toString() === studentFilter;
        const matchesSubject = !subjectFilter || grade.subject === subjectFilter;
        const matchesRange = !rangeFilter || isGradeInRange(grade.grade, rangeFilter);
        
        return matchesSearch && matchesStudent && matchesSubject && matchesRange;
    });

    // If student role, show only their grades
    if (currentUser?.role === 'student') {
        // For demo purposes, we'll show all grades. In a real app, you'd filter by student ID
        // filteredGrades = filteredGrades.filter(grade => grade.studentId === currentUser.studentId);
    }

    // Update results count
    const countElement = document.getElementById('gradesCount');
    if (countElement) {
        countElement.textContent = filteredGrades.length;
    }

    const canManage = isAllowed(['admin', 'teacher']);
    tbody.innerHTML = filteredGrades.map(grade => {
        const student = students.find(s => s.id === grade.studentId);
        return `
            <tr>
                <td>${student ? student.name : 'غير معروف'}</td>
                <td>${grade.subject}</td>
                <td><span class="grade-badge grade-${getGradeClass(grade.grade)}">${grade.grade}</span></td>
                <td>${formatDate(grade.date)}</td>
                ${canManage ? `<td>
                    <button class="btn btn-small" onclick="editGrade(${grade.id})">${translations[currentLanguage].edit}</button>
                    <button class="btn btn-danger btn-small" onclick="deleteGrade(${grade.id})">${translations[currentLanguage].delete}</button>
                </td>` : `<td class="role-hidden"></td>`}
            </tr>
        `;
    }).join('');
}

function isGradeInRange(grade, range) {
    const [min, max] = range.split('-').map(Number);
    return grade >= min && grade <= max;
}

function getGradeClass(grade) {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'very-good';
    if (grade >= 70) return 'good';
    if (grade >= 60) return 'acceptable';
    return 'poor';
}

function updateGradeFilters() {
    updateGradeStudentFilter();
    updateGradeSubjectFilter();
}

function updateGradeStudentFilter() {
    const studentFilter = document.getElementById('gradeStudentFilter');
    if (!studentFilter) return;
    
    const currentValue = studentFilter.value;
    studentFilter.innerHTML = `<option value="">${translations[currentLanguage].all_students || 'جميع الطلاب'}</option>`;
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        studentFilter.appendChild(option);
    });
    
    studentFilter.value = currentValue;
}

function updateGradeSubjectFilter() {
    const subjectFilter = document.getElementById('gradeSubjectFilter');
    if (!subjectFilter) return;
    
    const subjects = [...new Set(grades.map(g => g.subject))];
    const currentValue = subjectFilter.value;
    
    subjectFilter.innerHTML = `<option value="">${translations[currentLanguage].all_subjects || 'جميع المواد'}</option>`;
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
    
    subjectFilter.value = currentValue;
}

function editGrade(id) {
    if (!isAllowed(['admin', 'teacher'])) return;
    const grade = grades.find(g => g.id === id);
    if (!grade) return;
    const student = students.find(s => s.id === grade.studentId);
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="form-group">
            <label>${translations[currentLanguage].student}</label>
            <input type="text" value="${student ? student.name : 'غير معروف'}" readonly>
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].subject}</label>
            <input type="text" id="editGradeSubject" value="${grade.subject}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].grade_value}</label>
            <input type="number" id="editGradeValue" min="0" max="100" value="${grade.grade}">
        </div>
        <div class="form-group">
            <label>${translations[currentLanguage].date}</label>
            <input type="date" id="editGradeDate" value="${grade.date}">
        </div>
    `;
    document.getElementById('editModal').classList.add('show');
    window.currentEditId = id;
    window.currentEditType = 'grade';
}

function deleteGrade(id) {
    if (!isAllowed(['admin', 'teacher'])) return;
    if (confirm(translations[currentLanguage].confirm_delete)) {
        grades = grades.filter(g => g.id !== id);
        saveData();
        displayGrades();
        updateDashboard();
        updateGradeFilters();
        updateCharts();
        showAlert(translations[currentLanguage].success_delete);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    if (currentLanguage === 'ar') {
        return date.toLocaleDateString('ar-SA');
    } else {
        return date.toLocaleDateString('en-US');
    }
}

function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('teachers', JSON.stringify(teachers));
    localStorage.setItem('grades', JSON.stringify(grades));
    localStorage.setItem('attendance', JSON.stringify(attendance));
}

function loadData() {
    students = JSON.parse(localStorage.getItem('students')) || [];
    teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    grades = JSON.parse(localStorage.getItem('grades')) || [];
    attendance = JSON.parse(localStorage.getItem('attendance')) || [];
}

// Dashboard update function
function updateDashboard() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalTeachers').textContent = teachers.length;
    
    const avgGrade = grades.length > 0 ? 
        Math.round(grades.reduce((sum, grade) => sum + parseFloat(grade.grade), 0) / grades.length) : 0;
    document.getElementById('avgGrade').textContent = avgGrade;
    
    const totalAttendanceRecords = attendance.length;
    const presentRecords = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendanceRecords > 0 ? 
        Math.round((presentRecords / totalAttendanceRecords) * 100) : 0;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    
    // Update trends (simplified calculation)
    updateTrends();
}

function updateTrends() {
    // Simple trend calculation - in a real app, you'd compare with previous periods
    const studentsTrend = document.getElementById('studentsTrend');
    const teachersTrend = document.getElementById('teachersTrend');
    const gradesTrend = document.getElementById('gradesTrend');
    const attendanceTrend = document.getElementById('attendanceTrend');
    
    if (studentsTrend) studentsTrend.textContent = '+' + Math.floor(Math.random() * 10) + '%';
    if (teachersTrend) teachersTrend.textContent = '+' + Math.floor(Math.random() * 5) + '%';
    if (gradesTrend) gradesTrend.textContent = '+' + Math.floor(Math.random() * 8) + '%';
    if (attendanceTrend) attendanceTrend.textContent = '+' + Math.floor(Math.random() * 6) + '%';
}

function updateGradeStudentOptions() {
    const gradeStudent = document.getElementById('gradeStudent');
    if (!gradeStudent) return;
    
    const currentValue = gradeStudent.value;
    gradeStudent.innerHTML = `<option value="">${translations[currentLanguage].select_student_option}</option>`;
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        gradeStudent.appendChild(option);
    });
    
    gradeStudent.value = currentValue;
}

// Tab management
function showTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Update displays when switching tabs
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            updateCharts();
            break;
        case 'students':
            displayStudents();
            updateGradeStudentOptions();
            break;
        case 'teachers':
            displayTeachers();
            updateTeacherSubjectFilter();
            break;
        case 'grades':
            displayGrades();
            updateGradeFilters();
            break;
    }
}

// Modal functions
function closeModal() {
    document.getElementById('editModal').classList.remove('show');
}

function saveEdit() {
    const editType = window.currentEditType;
    const editId = window.currentEditId;
    
    if (editType === 'student') {
        const student = students.find(s => s.id === editId);
        if (student) {
            student.name = document.getElementById('editStudentName').value.trim();
            student.age = parseInt(document.getElementById('editStudentAge').value);
            student.class = document.getElementById('editStudentClass').value;
            student.phone = document.getElementById('editStudentPhone').value.trim();
            
            saveData();
            displayStudents();
            updateDashboard();
            updateGradeStudentOptions();
            updateCharts();
            showAlert(translations[currentLanguage].success_update);
        }
    } else if (editType === 'teacher') {
        const teacher = teachers.find(t => t.id === editId);
        if (teacher) {
            teacher.name = document.getElementById('editTeacherName').value.trim();
            teacher.subject = document.getElementById('editTeacherSubject').value.trim();
            teacher.phone = document.getElementById('editTeacherPhone').value.trim();
            teacher.email = document.getElementById('editTeacherEmail').value.trim();
            
            saveData();
            displayTeachers();
            updateDashboard();
            updateTeacherSubjectFilter();
            updateCharts();
            showAlert(translations[currentLanguage].success_update);
        }
    } else if (editType === 'grade') {
        const grade = grades.find(g => g.id === editId);
        if (grade) {
            grade.subject = document.getElementById('editGradeSubject').value.trim();
            grade.grade = parseFloat(document.getElementById('editGradeValue').value);
            grade.date = document.getElementById('editGradeDate').value;
            
            saveData();
            displayGrades();
            updateDashboard();
            updateGradeFilters();
            updateCharts();
            showAlert(translations[currentLanguage].success_update);
        }
    }
    
    closeModal();
}

// Authentication functions
function isAllowed(roles) {
    return !currentUser || roles.includes(currentUser.role);
}

function bindLoginUI() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (!currentUser && loginOverlay) {
        loginOverlay.style.display = 'flex';
        renderDemoAccounts();
        updateLoginHint();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const role = document.getElementById('loginRole').value;
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    const user = demoUsers.find(u => 
        u.role === role && u.username === username && u.password === password
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('loginOverlay').style.display = 'none';
        applySessionUI();
        showAlert(translations[currentLanguage].success_login || 'تم تسجيل الدخول بنجاح');
    } else {
        showAlert(translations[currentLanguage].login_failed, 'danger');
    }
    
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginOverlay').style.display = 'flex';
    applySessionUI();
    showAlert(translations[currentLanguage].success_logout || 'تم تسجيل الخروج بنجاح');
}

function applySessionUI() {
    const roleElements = document.querySelectorAll('[data-role-allowed]');
    roleElements.forEach(element => {
        const allowedRoles = element.getAttribute('data-role-allowed').split(',');
        if (currentUser && allowedRoles.includes(currentUser.role)) {
            element.classList.remove('role-hidden');
        } else {
            element.classList.add('role-hidden');
        }
    });
    
    // Update user info display
    const userInfo = document.querySelector('.user-info');
    if (userInfo && currentUser) {
        userInfo.textContent = `${translations[currentLanguage].logged_in_as}: ${currentUser.name}`;
    }
}

function renderDemoAccounts() {
    const demoAccountsDiv = document.getElementById('demoAccounts');
    if (!demoAccountsDiv) return;
    
    const title = currentLanguage === 'ar' ? 'حسابات تجريبية:' : 'Demo Accounts:';
    demoAccountsDiv.innerHTML = `
        <h4>${title}</h4>
        ${demoUsers.map(user => `
            <div class="demo-account">
                ${user.role}: ${user.username} / ${user.password}
            </div>
        `).join('')}
    `;
}

function updateLoginHint() {
    const loginHint = document.getElementById('loginHint');
    const selectedRole = document.getElementById('loginRole')?.value || 'admin';
    
    if (loginHint) {
        const hintKey = `login_hint_${selectedRole}`;
        loginHint.textContent = translations[currentLanguage][hintKey] || '';
    }
}

// Attendance functions (simplified)
function loadAttendanceList() {
    const date = document.getElementById('attendanceDate').value;
    const className = document.getElementById('attendanceClass').value;
    
    if (!date || !className) {
        showAlert(translations[currentLanguage].error_fill_fields, 'warning');
        return;
    }
    
    const classStudents = students.filter(s => s.class === className);
    const attendanceList = document.getElementById('attendanceList');
    
    attendanceList.innerHTML = `
        <h3>${translations[currentLanguage].attendance_for || 'حضور'} ${className} - ${formatDate(date)}</h3>
        <div class="attendance-grid">
            ${classStudents.map(student => {
                const existingRecord = attendance.find(a => 
                    a.studentId === student.id && a.date === date
                );
                const status = existingRecord ? existingRecord.status : 'present';
                
                return `
                    <div class="attendance-item">
                        <span class="student-name">${student.name}</span>
                        <div class="attendance-controls">
                            <label>
                                <input type="radio" name="attendance_${student.id}" value="present" 
                                       ${status === 'present' ? 'checked' : ''}>
                                ${translations[currentLanguage].present}
                            </label>
                            <label>
                                <input type="radio" name="attendance_${student.id}" value="absent" 
                                       ${status === 'absent' ? 'checked' : ''}>
                                ${translations[currentLanguage].absent}
                            </label>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('saveAttendanceBtn').style.display = 'block';
}

function saveAttendance() {
    const date = document.getElementById('attendanceDate').value;
    const className = document.getElementById('attendanceClass').value;
    const classStudents = students.filter(s => s.class === className);
    
    // Remove existing attendance records for this date and class
    attendance = attendance.filter(a => {
        const student = students.find(s => s.id === a.studentId);
        return !(student && student.class === className && a.date === date);
    });
    
    // Add new attendance records
    classStudents.forEach(student => {
        const statusInput = document.querySelector(`input[name="attendance_${student.id}"]:checked`);
        if (statusInput) {
            attendance.push({
                id: Date.now() + student.id,
                studentId: student.id,
                date: date,
                status: statusInput.value
            });
        }
    });
    
    saveData();
    updateDashboard();
    updateCharts();
    showAlert(translations[currentLanguage].success_save || 'تم الحفظ بنجاح');
}

// Report functions (simplified)
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const classFilter = document.getElementById('reportClass').value;
    const reportContent = document.getElementById('reportContent');
    
    let content = '';
    
    switch(reportType) {
        case 'students':
            content = generateStudentsReport(classFilter);
            break;
        case 'teachers':
            content = generateTeachersReport();
            break;
        case 'grades':
            content = generateGradesReport(classFilter);
            break;
        case 'attendance':
            content = generateAttendanceReport(classFilter);
            break;
    }
    
    reportContent.innerHTML = content;
    document.getElementById('printReportBtn').style.display = 'block';
}

function generateStudentsReport(classFilter) {
    const filteredStudents = classFilter ? 
        students.filter(s => s.class === classFilter) : students;
    
    return `
        <div class="report">
            <h3>${translations[currentLanguage].students_report}</h3>
            <p>${translations[currentLanguage].total_students}: ${filteredStudents.length}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${translations[currentLanguage].name}</th>
                        <th>${translations[currentLanguage].age}</th>
                        <th>${translations[currentLanguage].class}</th>
                        <th>${translations[currentLanguage].phone}</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredStudents.map(student => `
                        <tr>
                            <td>${student.name}</td>
                            <td>${student.age}</td>
                            <td>${student.class}</td>
                            <td>${student.phone}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateTeachersReport() {
    return `
        <div class="report">
            <h3>${translations[currentLanguage].teachers_report}</h3>
            <p>${translations[currentLanguage].total_teachers}: ${teachers.length}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${translations[currentLanguage].name}</th>
                        <th>${translations[currentLanguage].subject}</th>
                        <th>${translations[currentLanguage].phone}</th>
                        <th>${translations[currentLanguage].email}</th>
                    </tr>
                </thead>
                <tbody>
                    ${teachers.map(teacher => `
                        <tr>
                            <td>${teacher.name}</td>
                            <td>${teacher.subject}</td>
                            <td>${teacher.phone}</td>
                            <td>${teacher.email}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateGradesReport(classFilter) {
    let filteredGrades = grades;
    
    if (classFilter) {
        const classStudentIds = students.filter(s => s.class === classFilter).map(s => s.id);
        filteredGrades = grades.filter(g => classStudentIds.includes(g.studentId));
    }
    
    return `
        <div class="report">
            <h3>${translations[currentLanguage].grades_report}</h3>
            <p>${translations[currentLanguage].total_grades || 'إجمالي الدرجات'}: ${filteredGrades.length}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${translations[currentLanguage].student}</th>
                        <th>${translations[currentLanguage].subject}</th>
                        <th>${translations[currentLanguage].grade}</th>
                        <th>${translations[currentLanguage].date}</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredGrades.map(grade => {
                        const student = students.find(s => s.id === grade.studentId);
                        return `
                            <tr>
                                <td>${student ? student.name : 'غير معروف'}</td>
                                <td>${grade.subject}</td>
                                <td>${grade.grade}</td>
                                <td>${formatDate(grade.date)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateAttendanceReport(classFilter) {
    let filteredAttendance = attendance;
    
    if (classFilter) {
        const classStudentIds = students.filter(s => s.class === classFilter).map(s => s.id);
        filteredAttendance = attendance.filter(a => classStudentIds.includes(a.studentId));
    }
    
    return `
        <div class="report">
            <h3>${translations[currentLanguage].attendance_report}</h3>
            <p>${translations[currentLanguage].total_records || 'إجمالي السجلات'}: ${filteredAttendance.length}</p>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${translations[currentLanguage].student}</th>
                        <th>${translations[currentLanguage].date}</th>
                        <th>${translations[currentLanguage].status || 'الحالة'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredAttendance.map(record => {
                        const student = students.find(s => s.id === record.studentId);
                        return `
                            <tr>
                                <td>${student ? student.name : 'غير معروف'}</td>
                                <td>${formatDate(record.date)}</td>
                                <td>${record.status === 'present' ? translations[currentLanguage].present : translations[currentLanguage].absent}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function printReport() {
    window.print();
}

