// horizontal nav links
let navLinks = {
  category1: [
    {
      menu_title: "sidebar.company",
      menu_icon: "zmdi zmdi-view-dashboard",
      new_item: false,
      child_routes: [
        {
          path: "/company/details",
          new_item: false,
          menu_title: "sidebar.companyDetails",
        },
        {
          path: "/company/expenseTypes",
          new_item: false,
          menu_title: "sidebar.expenseTypes",
        },
        {
          path: "/company/journalEntry",
          new_item: false,
          menu_title: "sidebar.journalEntries",
        },
        {
          path: "/company/corporateDocs",
          new_item: false,
          menu_title: "sidebar.corporateDocs",
        },
        {
          path: "/company/makeReadyTask",
          new_item: false,
          menu_title: "sidebar.makeReadyTasks",
        },
        {
          path: "/company/formsCreator",
          new_item: false,
          menu_title: "sidebar.formCreator",
        },
        {
          path: "/",
          new_item: false,
          menu_title: "sidebar.budgetCreator",
        },
        {
          path: "/company/glCategories",
          new_item: false,
          menu_title: "sidebar.glCategories",
        },
      ],
    },
    {
      menu_title: "sidebar.properties",
      menu_icon: "zmdi zmdi-home",
      new_item: false,
      child_routes: [
        {
          path: "/",
          new_item: false,
          menu_title: "sidebar.viewProperties",
        },
        {
          path: "/properties/rules",
          new_item: false,
          menu_title: "sidebar.propertyRules",
        },
        {
          path: "/",
          new_item: true,
          menu_title: "sidebar.propertyWizard",
        },
      ],
    },
    {
      menu_title: "sidebar.users",
      new_item: false,
      menu_icon: "zmdi zmdi-accounts",
      child_routes: [
        {
          path: "/users/viewAll",
          new_item: false,
          menu_title: "sidebar.viewUsers",
        },
      ],
    },
    {
      menu_title: "sidebar.owners",
      new_item: false,
      menu_icon: "zmdi zmdi-account-box-mail",
      child_routes: [
        {
          path: "/owners/viewAll",
          new_item: false,
          menu_title: "sidebar.viewOwners",
        },
      ],
    },
    {
      menu_title: "sidebar.untis",
      new_item: false,
      menu_icon: "zmdi zmdi-home",
      child_routes: [
        {
          path: "/",
          new_item: false,
          menu_title: "sidebar.viewUnits",
        },
      ],
    },
  ],
  category2: [
    {
      menu_title: "sidebar.checkRegister",
      menu_icon: "zmdi zmdi-money-box",
      path: "/checkRegister",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.bills",
      menu_icon: "zmdi zmdi-money-off",
      new_item: false,
      child_routes: [
        {
          path: "/bills/unpaidBills",
          new_item: false,
          menu_title: "sidebar.unpaidBills",
        },
        {
          path: "/bills/paidBills",
          new_item: false,
          menu_title: "sidebar.paidBills",
        },
        {
          path: "/bills/recurring",
          new_item: false,
          menu_title: "sidebar.recurringBills",
        },
      ],
    },
    {
      menu_title: "sidebar.deposits",
      menu_icon: "zmdi zmdi-money",
      new_item: false,
      child_routes: [
        {
          path: "/deposits",
          new_item: false,
          menu_title: "sidebar.currentDeposit",
        },
        {
          path: "/deposits/history",
          new_item: false,
          menu_title: "sidebar.depositHistory",
        },
        {
          path: "/deposits/enterCCPayment",
          new_item: true,
          menu_title: "sidebar.enterCCPayment",
        },
      ],
    },
    {
      menu_title: "sidebar.vendors",
      menu_icon: "zmdi zmdi-male-female",
      path: "/vendor",
      new_item: false,
      child_routes: null,
    },
  ],
  category3: [
    {
      menu_title: "sidebar.applicants",
      new_item: false,
      menu_icon: "zmdi zmdi-accounts-add",
      child_routes: [
        {
          path: "/prospects/viewAll",
          new_item: false,
          menu_title: "sidebar.viewProspects",
        },
        {
          path: "/applicants/viewAll",
          new_item: false,
          menu_title: "sidebar.viewApplicants",
        },
        {
          path: "/prospects/add",
          new_item: false,
          menu_title: "sidebar.addApplicant",
        },
        {
          path: "/applicants/denied",
          new_item: false,
          menu_title: "sidebar.deniedApplicants",
        },
      ],
    },
    {
      menu_title: "sidebar.tenants",
      new_item: false,
      menu_icon: "zmdi zmdi-accounts-outline",
      child_routes: [
        {
          path: "/tenants/viewAll",
          new_item: false,
          menu_title: "sidebar.viewAllTenants",
        },
        {
          path: "/tenants/add",
          new_item: false,
          menu_title: "sidebar.addTenant",
        },
        {
          path: "/tenants/previous",
          new_item: false,
          menu_title: "sidebar.previousTenants",
        },
        {
          path: "/tenants/addFee",
          new_item: false,
          menu_title: "sidebar.applyAdditionalFee",
        },
        {
          path: "/tenants/reqConcession",
          new_item: false,
          menu_title: "sidebar.requestConcession",
        },
        {
          path: "/tenants/reconcilePrevious",
          new_item: false,
          menu_title: "sidebar.reconcilePreviousTenants",
        },
        {
          new_item: false,
          menu_title: "sidebar.tenantsPrintableDocs",
          menu_icon: "zmdi zmdi-view-carousel",
          child_routes: [
            {
              path: "/printable/allTenantStatements",
              new_item: false,
              menu_title: "sidebar.allTenantsStatements",
            },
            {
              path: "/",
              new_item: false,
              menu_title: "sidebar.allDeliquentTenants",
            },
            {
              path: "/",
              new_item: false,
              menu_title: "sidebar.emailAllLeaseAgreements",
            },
          ],
        },
        {
          new_item: false,
          menu_title: "sidebar.communication",
          menu_icon: "zmdi zmdi-view-carousel",
          child_routes: [
            {
              path: "/",
              new_item: false,
              menu_title: "sidebar.notifyAllTenants",
            },
          ],
        },
      ],
    },
    {
      menu_title: "sidebar.workOrders",
      new_item: false,
      menu_icon: "zmdi zmdi-markunread-mailbox",
      child_routes: [
        {
          path: "/workOrders/add",
          new_item: false,
          menu_title: "sidebar.addViewWorkOrder",
        },
        {
          path: "/workOrders/closed",
          new_item: false,
          menu_title: "sidebar.closedWorkOrder",
        },
        {
          path: "/workOrders/recurring",
          new_item: false,
          menu_title: "sidebar.recurringWorkOrder",
        },
        {
          new_item: false,
          menu_title: "sidebar.makeReadyBoard",
          menu_icon: "zmdi zmdi-view-carousel",
          child_routes: [
            {
              path: "/",
              new_item: false,
              menu_title: "sidebar.viewMakeReady",
            },
          ],
        },
      ],
    },
  ],
  category4: [
    {
      menu_title: "sidebar.reports",
      new_item: false,
      path: "",
      menu_icon: "zmdi zmdi-file-text",
      child_routes: null,
    },
  ],
  category5: [
    {
      menu_title: "sidebar.marketingText",
      new_item: false,
      path: "",
      menu_icon: "zmdi zmdi-map",
      child_routes: null,
    },
    {
      menu_title: "sidebar.postVacancies",
      new_item: false,
      path: "",
      menu_icon: "zmdi zmdi-http",
      child_routes: null,
    },
  ],
  category6: [
    {
      menu_title: "sidebar.supportRequest",
      menu_icon: "zmdi zmdi-help-outline",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.suggestFeatureImprovement",
      menu_icon: "zmdi zmdi-alert-polygon",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.videoTutorial",
      menu_icon: "zmdi zmdi-collection-video",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.userGuide",
      menu_icon: "zmdi zmdi-pin-account",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.FAQ",
      menu_icon: "zmdi zmdi-open-in-browser",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.requestHistory",
      menu_icon: "zmdi zmdi-notifications",
      path: "",
      new_item: false,
      child_routes: null,
    },
    {
      menu_title: "sidebar.licenseAgreement",
      menu_icon: "zmdi zmdi-swap",
      path: "",
      new_item: false,
      child_routes: null,
    },
  ],
};

export default navLinks;
