import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import SessionTimeout from "./SessionTimeOut";
import Login from "./Login/Login";
// Home
import Home from "./Home/Home";
import EditMoveOutDate from "./Home/SubPages/EditMoveOutDate";
import EditNote from "./Home/SubPages/EditNote";
import PreLease from "./Home/SubPages/PreLease";
import EditActionItem from "./Home/SubPages/EditActionItem";
import EditPromissToPay from "./Home/SubPages/EditPromissToPay";
import EditDelinquencyComment from "./Home/SubPages/EditDeliquencyComment";
// Profile
import Profile from "./Profile/Profile";
// Company
import CompanyDetails from "./Company/CompanyDetails";
import ExpenseTypes from "./Company/ExpenseTypes";
import JournalEntry from "./Company/JournalEntry";
import EditJournal from "./Company/EditJournal";
import MakeReadyTask from "./Company/MakeReadyTask";
import EditMakeReadyTask from "./Company/EditMakeReadyTask";
import FormsCreator from "./Company/FormsCreator";
import GLCategories from "./Company/GLCategories";
import CorporateDocs from "./Company/CorporateDocs";
// Properties
import PropertyRules from "./Properties/PropertyRules";
// Users
import ViewAllUsers from "./Users/ViewAll";
import AddUser from "./Users/AddUser";
import EditUser from "./Users/EditUser";
// Owners
import ViewAllOwners from "./Owners/ViewAll";
import AddOwner from "./Owners/AddOwner";
import EditOwner from "./Owners/EditOwner";
// Check Register
import CheckRegister from "./CheckRegister/CheckRegister";
import Reconcile from "./CheckRegister/Reconcile";
import EditCheckRegister from "./CheckRegister/EditCheckRegister";
// Bills
import UnpaidBills from "./Bills/Unpaid/UnpaidBills";
import PaidBills from "./Bills/Paid/PaidBills";
import RecurringBills from "./Bills/Recurring/RecurringBills";
import EditBill from "./Bills/EditBill";
// Tenants
import ViewAll from "./Tenants/ViewAll";
import TenantDetails from "./Tenants/TenantDetails";
import AddLeaseHolder from "./Tenants/AddLeaseHolder";
import AddVehicle from "./Tenants/AddVehicle";
import EditTenant from "./Tenants/EditTenant";
import TransferTenant from "./Tenants/TransferTenant";
import AddTenant from "./Tenants/AddTenant";
import PreviousTenants from "./Tenants/PreviousTenants";
import ReconcilePrevious from "./Tenants/ReconcilePrevious";
import ApplyAdditionalFee from "./Tenants/ApplyAddtionalFee";
import RequestConcession from "./Tenants/RequestConcession";
// Applicants
import ViewProspects from "./Applicants/Prospect/ViewAll";
import EditProspectApplicant from "./Applicants/Prospect/EditProspectApplicant";
import ConvertToApplicant from "./Applicants/Prospect/ConvertToApplicant";
import ViewApplicants from "./Applicants/Applicant/ViewAll";
import ViewReport from "./Applicants/Applicant/ViewBackgroundReport";
import AddApplicantLeaseHolder from "./Applicants/Applicant/AddLeaseHolder";
import ConvertToTenant from "./Applicants/Applicant/ConvertToTenant";
import RunBackgroundScreening from "./Applicants/Applicant/RunBackgroundScreening";
import SignUpBackgroundScreening from "./Applicants/Applicant/SignUpBackgroundScreening";
import ViewApplication from "./Applicants/Applicant/ViewApplication";
import AddProspectApplicant from "./Applicants/Prospect/Add";
import DeniedApplicants from "./Applicants/Denied/Denied";
// Printable
import AccountSummaryTenantStatement from "./Printable/AccountSummaryTenantStatement";
import ViewWorkOrder from "./Printable/ViewWorkOrder";
import PrintTenantLedger from "./Printable/PrintTenantLedger";
import OpenForm from "./Printable/OpenForm";
import DepositSlip from "./Printable/DepositSlip";
import AllTenantsStatements from "./Printable/AllTenantsStatement";
// Work Orders
import AddWorkOrder from "./WorkOrders/AddWorkOrder";
import EditWorkOrder from "./WorkOrders/UpdateWorkOrder";
import ClosedWorkOrders from "./WorkOrders/ClosedWorkOrders";
import RecurringWorkOrders from "./WorkOrders/RecurringWorkOrders";
import UpdateRecurring from "./WorkOrders/UpdateRecurring";
// Deposits
import Deposits from "./Deposits/Deposits";
import EditDeposit from "./Deposits/EditDeposit";
import AddLender from "./Deposits/AddLender";
import DepositBreakDown from "./Deposits/DepositBreakDown";
import EditTransaction from "./Deposits/EditTransaction";
import History from "./Deposits/History";
import EditDeposirHistory from "./Deposits/EditDepositHistory";
import EnterTenantCCPayment from "./Deposits/EnterTenantCCPayment";
// Vendor
import Vendors from "./Vendors/Vendors";
import EditVendor from "./Vendors/EditVendor";
// Force Logout
import ForceLogOut from "./Login/ForceLogOut";

const PrivateRoute = ({ component, ...options }) => {
  const login = useSelector((state) => state.login);
  const finalComponent = login.logged ? component : Login;

  return <Route {...options} component={finalComponent} />;
};

const Navigation = () => {
  return (
    <Router>
      <SessionTimeout />
      <Switch>
        <PrivateRoute exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <PrivateRoute
          exact
          path="/editMoveOutDate"
          component={EditMoveOutDate}
        />
        <PrivateRoute exact path="/editNote" component={EditNote} />
        <PrivateRoute exact path="/preLease" component={PreLease} />
        <PrivateRoute exact path="/editActionItem" component={EditActionItem} />
        <PrivateRoute
          exact
          path="/editPromissToPay"
          component={EditPromissToPay}
        />
        <PrivateRoute
          exact
          path="/editDelinquencyComment"
          component={EditDelinquencyComment}
        />
        <PrivateRoute exact path="/profile" component={Profile} />
        <PrivateRoute
          exact
          path="/company/details"
          component={CompanyDetails}
        />
        <PrivateRoute
          exact
          path="/company/expenseTypes"
          component={ExpenseTypes}
        />
        <PrivateRoute
          exact
          path="/company/journalEntry"
          component={JournalEntry}
        />
        <PrivateRoute
          exact
          path="/company/journal/edit"
          component={EditJournal}
        />
        <PrivateRoute
          exact
          path="/company/makeReadyTask"
          component={MakeReadyTask}
        />
        <PrivateRoute
          exact
          path="/company/makeReadyTask/edit"
          component={EditMakeReadyTask}
        />
        <PrivateRoute
          exact
          path="/company/formsCreator"
          component={FormsCreator}
        />
        <PrivateRoute
          exact
          path="/company/glCategories"
          component={GLCategories}
        />
        <PrivateRoute
          exact
          path="/company/corporateDocs"
          component={CorporateDocs}
        />
        <PrivateRoute
          exact
          path="/properties/rules"
          component={PropertyRules}
        />
        <PrivateRoute exact path="/users/viewAll" component={ViewAllUsers} />
        <PrivateRoute exact path="/users/add" component={AddUser} />
        <PrivateRoute exact path="/users/edit" component={EditUser} />
        <PrivateRoute exact path="/owners/viewAll" component={ViewAllOwners} />
        <PrivateRoute exact path="/owners/add" component={AddOwner} />
        <PrivateRoute exact path="/owners/edit" component={EditOwner} />
        <PrivateRoute exact path="/checkRegister" component={CheckRegister} />
        <PrivateRoute
          exact
          path="/checkRegister/edit"
          component={EditCheckRegister}
        />
        <PrivateRoute exact path="/reconcile" component={Reconcile} />
        <PrivateRoute exact path="/bills/unpaidBills" component={UnpaidBills} />
        <PrivateRoute exact path="/bills/paidBills" component={PaidBills} />
        <PrivateRoute
          exact
          path="/bills/recurring"
          component={RecurringBills}
        />
        <PrivateRoute exact path="/bills/edit" component={EditBill} />
        <PrivateRoute exact path="/deposits" component={Deposits} />
        <PrivateRoute exact path="/deposits/edit" component={EditDeposit} />
        <PrivateRoute exact path="/deposits/addLender" component={AddLender} />
        <PrivateRoute exact path="/deposits/history" component={History} />
        <PrivateRoute
          exact
          path="/deposits/history/edit"
          component={EditDeposirHistory}
        />
        <PrivateRoute
          exact
          path="/deposits/enterCCPayment"
          component={EnterTenantCCPayment}
        />
        <PrivateRoute exact path="/tenants/viewAll" component={ViewAll} />
        <PrivateRoute exact path="/tenants/details" component={TenantDetails} />
        <PrivateRoute
          exact
          path="/tenants/addLeaseHolder"
          component={AddLeaseHolder}
        />
        <PrivateRoute exact path="/tenants/addVehicle" component={AddVehicle} />
        <PrivateRoute exact path="/tenants/editTenant" component={EditTenant} />
        <PrivateRoute
          exact
          path="/tenants/transfer"
          component={TransferTenant}
        />
        <PrivateRoute exact path="/tenants/add" component={AddTenant} />
        <PrivateRoute
          exact
          path="/tenants/previous"
          component={PreviousTenants}
        />
        <PrivateRoute
          exact
          path="/tenants/reconcilePrevious"
          component={ReconcilePrevious}
        />
        <PrivateRoute
          exact
          path="/tenants/addFee"
          component={ApplyAdditionalFee}
        />
        <PrivateRoute
          exact
          path="/tenants/reqConcession"
          component={RequestConcession}
        />
        <PrivateRoute
          exact
          path="/prospects/viewAll"
          component={ViewProspects}
        />
        <PrivateRoute
          exact
          path="/prospects/edit"
          component={EditProspectApplicant}
        />
        <PrivateRoute
          exact
          path="/prospects/convertToApplicant"
          component={ConvertToApplicant}
        />
        <PrivateRoute
          exact
          path="/prospects/add"
          component={AddProspectApplicant}
        />
        <PrivateRoute
          exact
          path="/applicants/viewAll"
          component={ViewApplicants}
        />
        <PrivateRoute
          exact
          path="/applicants/viewReport"
          component={ViewReport}
        />
        <PrivateRoute
          exact
          path="/applicants/addLeaseHolder"
          component={AddApplicantLeaseHolder}
        />
        <PrivateRoute
          exact
          path="/applicants/convertToTenant"
          component={ConvertToTenant}
        />
        <PrivateRoute
          exact
          path="/applicants/runBackgroundScreening"
          component={RunBackgroundScreening}
        />
        <PrivateRoute
          exact
          path="/applicants/signupBackground"
          component={SignUpBackgroundScreening}
        />
        <PrivateRoute
          exact
          path="/applicants/viewApplication"
          component={ViewApplication}
        />
        <PrivateRoute
          exact
          path="/applicants/denied"
          component={DeniedApplicants}
        />
        <PrivateRoute
          exact
          path="/printable/accSummaryStatement"
          component={AccountSummaryTenantStatement}
        />
        <PrivateRoute
          exact
          path="/printable/viewWorkOrder"
          component={ViewWorkOrder}
        />
        <PrivateRoute
          exact
          path="/printable/printTenantLedger"
          component={PrintTenantLedger}
        />
        <PrivateRoute exact path="/printable/openForm" component={OpenForm} />
        <PrivateRoute
          exact
          path="/printable/depositSlip"
          component={DepositSlip}
        />
        <PrivateRoute
          exact
          path="/printable/allTenantStatements"
          component={AllTenantsStatements}
        />
        <PrivateRoute exact path="/workOrders/add" component={AddWorkOrder} />
        <PrivateRoute
          exact
          path="/workOrders/update"
          component={EditWorkOrder}
        />
        <PrivateRoute
          exact
          path="/workOrders/closed"
          component={ClosedWorkOrders}
        />
        <PrivateRoute
          exact
          path="/workOrders/recurring"
          component={RecurringWorkOrders}
        />
        <PrivateRoute
          exact
          path="/workOrders/updateRecurring"
          component={UpdateRecurring}
        />
        <PrivateRoute
          exact
          path="/deposits/breakdown"
          component={DepositBreakDown}
        />
        <PrivateRoute
          exact
          path="/deposits/editTransaction"
          component={EditTransaction}
        />
        <PrivateRoute exact path="/vendor" component={Vendors} />
        <PrivateRoute exact path="/vendor/edit" component={EditVendor} />
        <PrivateRoute exact path="/forceLogOut" component={ForceLogOut} />
      </Switch>
    </Router>
  );
};

export default Navigation;
