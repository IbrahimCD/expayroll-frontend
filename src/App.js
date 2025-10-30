// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';

// Import Auth pages
import Login from './pages/LoginSignup/Login';
import Signup from './pages/LoginSignup/Signup';
import ForgotPassword from './pages/LoginSignup/ForgotPassword';

// Import Dashboard & User Management pages
import Dashboard from './pages/Dashboard/Dashboard';
import CreateUser from './pages/Dashboard/user/CreateUser';
import UserList from './pages/Dashboard/user/UserList';
import EditUser from './pages/Dashboard/user/EditUser';

// Import Profile page
import Profile from './pages/LoginSignup/Profile';

import { AuthContext } from './contexts/AuthContext';

// Import Employee pages
import { CreateEmployeePage, EmployeeList, EditEmployeePage } from './pages/Employee';
import EmployeeDetailsPage from './pages/Employee/EmployeeDetailsPage';
import BatchCreateEmployeePage from './pages/Employee/BatchCreateEmployeePage'; // New Batch Create Employee page

// Import Location pages
import CreateLocation from './pages/Location/CreateLocation';
import LocationList from './pages/Location/LocationList';
import EditLocation from './pages/Location/EditLocation';
import EmployeeListByLocation from './pages/Location/EmployeeListByLocation';

// Import Timesheet pages
import CreateTimesheetPage from './pages/Timesheet/CreateTimesheetPage';
import TimesheetList from './pages/Timesheet/TimesheetList';
import EditTimesheetPage from './pages/Timesheet/EditTimesheetPage';
import TimesheetDetailsPage from './pages/Timesheet/TimesheetDetailsPage';

// Import new Batch Timesheet pages
import BatchCreateTimesheetTemplatePage from './pages/Timesheet/BatchCreateTimesheetTemplatePage';
import BatchCreateTimesheetPage from './pages/Timesheet/BatchCreateTimesheetPage';

// Import PayRun pages
import { PayRunList, CreatePayRunPage, PayRunDetailsPage } from './pages/PayRun';
// ...
import WageCostAllocationReportPage from './pages/Reports/WageCostAllocationReportPage';
import BatchCreateNICTaxTemplatePage from './pages/NICTax/BatchCreateNICTaxTemplatePage';
import EmployeeWageReportPage from './pages/Reports/EmployeeWageReportPage';
import BatchUpdateEmployeePage from './pages/Employee/BatchUpdateEmployeePage';

// Import Reminders & Notifications pages
import ReminderList from './pages/Reminders/ReminderList';
import CreateReminder from './pages/Reminders/CreateReminder';
import ReminderDetails from './pages/Reminders/ReminderDetails';
import NotificationList from './pages/Notifications/NotificationList';

// Import NIC & TAX pages (new module)
import {
  CreateNICTaxPage,
  NICTaxList,
  NICTaxDetailsPage,
  EditNICTaxPage
} from './pages/NICTax';

// Import Purchase pages
import { PurchaseLocationSelect, PurchasePage } from './pages/Purchase';

function App() {
  const { token } = useContext(AuthContext);

  // Helper function to check if user is authenticated
  const isAuthenticated = () => !!token;

  return (
    <Router>
      <Routes>
        {/* Default route: if authenticated, navigate to /dashboard; otherwise, show Login */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Public Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <Dashboard />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports/employee-wage-report"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EmployeeWageReportPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/employees/batch-update"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <BatchUpdateEmployeePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Pay Run */}
        <Route
          path="/payruns"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <PayRunList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/payruns/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreatePayRunPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/payruns/:payRunId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <PayRunDetailsPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* NIC & TAX */}
        <Route
          path="/nictax"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <NICTaxList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/nictax/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateNICTaxPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/nictax/:nictaxId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <NICTaxDetailsPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/nictax/edit/:nictaxId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EditNICTaxPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reports/wage-cost-allocation"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <WageCostAllocationReportPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/nictax/batch-template"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <BatchCreateNICTaxTemplatePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <Profile />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* User Management */}
        <Route
          path="/users"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <UserList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/users/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateUser />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/users/edit/:userId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EditUser />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Locations */}
        <Route
          path="/locations"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <LocationList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/locations/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateLocation />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/locations/edit/:id"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EditLocation />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/locations/:id/employees"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EmployeeListByLocation />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EmployeeList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/employees/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateEmployeePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* Batch Create Employee */}
        <Route
          path="/employees/batch"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <BatchCreateEmployeePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/employees/edit/:employeeId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EditEmployeePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/employees/details/:employeeId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EmployeeDetailsPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Timesheets */}
        <Route
          path="/timesheets"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <TimesheetList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/timesheets/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateTimesheetPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/timesheets/edit/:timesheetId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <EditTimesheetPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/timesheets/:timesheetId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <TimesheetDetailsPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Batch Timesheet Template & Batch Timesheet Creation */}
        <Route
          path="/timesheets/batch-template"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <BatchCreateTimesheetTemplatePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/timesheets/batch-create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <BatchCreateTimesheetPage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* REMINDERS */}
        <Route
          path="/reminders"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <ReminderList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reminders/create"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <CreateReminder />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/reminders/:reminderId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <ReminderDetails />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <NotificationList />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* PURCHASE */}
        <Route
          path="/purchases"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <PurchaseLocationSelect />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/purchases/:locationId"
          element={
            isAuthenticated() ? (
              <MainLayout>
                <PurchasePage />
              </MainLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
