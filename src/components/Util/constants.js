import { createMuiTheme } from '@material-ui/core/styles';

//export const REQ_URL = 'http://localhost:3006';
export const REQ_URL = 'https://myirent.com/NodeJS/iRent';
export const DEFAULT_ERROR = 'Error processing your request. Please contact us.';
export const TINYMCEKEY = "771zhy8nf9edmn3yv4nh8hgsgxk8sw3bs20ljmehxp2fu7wx";

export const usStates = [
    { name: 'ALABAMA', abbreviation: 'AL'},
    { name: 'ALASKA', abbreviation: 'AK'},
    { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
    { name: 'ARIZONA', abbreviation: 'AZ'},
    { name: 'ARKANSAS', abbreviation: 'AR'},
    { name: 'CALIFORNIA', abbreviation: 'CA'},
    { name: 'COLORADO', abbreviation: 'CO'},
    { name: 'CONNECTICUT', abbreviation: 'CT'},
    { name: 'DELAWARE', abbreviation: 'DE'},
    { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
    { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
    { name: 'FLORIDA', abbreviation: 'FL'},
    { name: 'GEORGIA', abbreviation: 'GA'},
    { name: 'GUAM', abbreviation: 'GU'},
    { name: 'HAWAII', abbreviation: 'HI'},
    { name: 'IDAHO', abbreviation: 'ID'},
    { name: 'ILLINOIS', abbreviation: 'IL'},
    { name: 'INDIANA', abbreviation: 'IN'},
    { name: 'IOWA', abbreviation: 'IA'},
    { name: 'KANSAS', abbreviation: 'KS'},
    { name: 'KENTUCKY', abbreviation: 'KY'},
    { name: 'LOUISIANA', abbreviation: 'LA'},
    { name: 'MAINE', abbreviation: 'ME'},
    { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
    { name: 'MARYLAND', abbreviation: 'MD'},
    { name: 'MASSACHUSETTS', abbreviation: 'MA'},
    { name: 'MICHIGAN', abbreviation: 'MI'},
    { name: 'MINNESOTA', abbreviation: 'MN'},
    { name: 'MISSISSIPPI', abbreviation: 'MS'},
    { name: 'MISSOURI', abbreviation: 'MO'},
    { name: 'MONTANA', abbreviation: 'MT'},
    { name: 'NEBRASKA', abbreviation: 'NE'},
    { name: 'NEVADA', abbreviation: 'NV'},
    { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
    { name: 'NEW JERSEY', abbreviation: 'NJ'},
    { name: 'NEW MEXICO', abbreviation: 'NM'},
    { name: 'NEW YORK', abbreviation: 'NY'},
    { name: 'NORTH CAROLINA', abbreviation: 'NC'},
    { name: 'NORTH DAKOTA', abbreviation: 'ND'},
    { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
    { name: 'OHIO', abbreviation: 'OH'},
    { name: 'OKLAHOMA', abbreviation: 'OK'},
    { name: 'OREGON', abbreviation: 'OR'},
    { name: 'PALAU', abbreviation: 'PW'},
    { name: 'PENNSYLVANIA', abbreviation: 'PA'},
    { name: 'PUERTO RICO', abbreviation: 'PR'},
    { name: 'RHODE ISLAND', abbreviation: 'RI'},
    { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
    { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
    { name: 'TENNESSEE', abbreviation: 'TN'},
    { name: 'TEXAS', abbreviation: 'TX'},
    { name: 'UTAH', abbreviation: 'UT'},
    { name: 'VERMONT', abbreviation: 'VT'},
    { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
    { name: 'VIRGINIA', abbreviation: 'VA'},
    { name: 'WASHINGTON', abbreviation: 'WA'},
    { name: 'WEST VIRGINIA', abbreviation: 'WV'},
    { name: 'WISCONSIN', abbreviation: 'WI'},
    { name: 'WYOMING', abbreviation: 'WY' }
];

export const themeColors = {
    'primary': '#5D92F4',
    'secondary': '#677080',
    'success': '#00D014',
    'danger': '#FF3739',
    'warning': '#FFB70F',
    'info': '#00D0BD',
    'dark': '#464D69',
    'default': '#FAFAFA',
    'greyLighten': '#A5A7B2',
    'grey': '#677080',
    'white': '#FFFFFF',
    'purple': '#896BD6',
    'yellow': '#D46B08'
 };

 // dark theme colors
 export const darkThemeColors = {
    darkBgColor: '#424242'
 };


const { primary, info, danger, success, warning, purple, secondary, yellow, white, greyLighten, grey } = themeColors;
export const ChartConfig = {
  color: {
    'primary': primary,
    'info': info,
    'warning': warning,
    'danger': danger,
    'success': success,
    'default': '#DEE4E8',
    'purple': purple,
    'secondary': secondary,
    'yellow': yellow,
    'white': '#FFFFFF',
    'dark': white,
    'greyLighten': greyLighten,
    'grey': grey
  },
  legendFontColor: '#AAAEB3', // only works on react chart js 2
  chartGridColor: '#EAEAEA',
  axesColor: '#657786',
  shadowColor: 'rgba(0,0,0,0.6)'
}

// Tooltip Styles
export const tooltipStyle = {
  backgroundColor: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(0,0,0,0.6)',
  borderRadius: '5px'
}

export const tooltipTextStyle = {
  color: '#FFF',
  fontSize: '12px',
  paddingTop: '5px',
  paddingBottom: '5px',
  lineHeight: '1'
}

export const getMuiTheme = () => createMuiTheme({
  overrides: {
      MuiTableCell: {
          head: {
              backgroundColor: "#c1e1ec !important"
          }
      }
  }
});

export const margins = {
  marginTop: '10px', 
  marginBottom: '30px', 
  marginLeft: '10px', 
  marginRight: '10px'
};

export const signatureFonts = [
  { name: 'Aguafina Script', value: 'Aguafina Script'},
  { name: 'Alex Brush', value: 'Alex Brush'},
  { name: 'Bilbo', value: 'Bilbo'},
  { name: 'Condiment', value: 'Condiment'},
  { name: 'Great Vibes', value: 'Great Vibes'},
  { name: 'Herr Von Muellerhoff', value: 'Herr Von Muellerhoff'},
  { name: 'Kristi', value: 'Kristi'},
  { name: 'Meddon', value: 'Meddon'},
  { name: 'Monsieur La Doulaise', value: 'Monsieur La Doulaise'},
  { name: 'Norican', value: 'Norican'},
  { name: 'Parisienne', value: 'Parisienne'},
  { name: 'Permanent Marker', value: 'Permanent Marker'},
  { name: 'Sacramento', value: 'Sacramento'},
  { name: 'Yellowtail', value: 'Yellowtail'},
];

export const workHours = [
  { value: -1, label: "Closed" },
  { value: 0, label: "12:00 AM" },
  { value: 1, label: "1:00 AM" },
  { value: 2, label: "2:00 AM" },
  { value: 3, label: "3:00 AM" },
  { value: 4, label: "4:00 AM" },
  { value: 5, label: "5:00 AM" },
  { value: 6, label: "6:00 AM" },
  { value: 7, label: "7:00 AM" },
  { value: 8, label: "8:00 AM" },
  { value: 9, label: "9:00 AM" },
  { value: 10, label: "10:00 AM" },
  { value: 11, label: "11:00 AM" },
  { value: 12, label: "12:00 PM" },
  { value: 13, label: "1:00 PM" },
  { value: 14, label: "2:00 PM" },
  { value: 15, label: "3:00 PM" },
  { value: 16, label: "4:00 PM" },
  { value: 17, label: "5:00 PM" },
  { value: 18, label: "6:00 PM" },
  { value: 19, label: "7:00 PM" },
  { value: 20, label: "8:00 PM" },
  { value: 21, label: "9:00 PM" },
  { value: 22, label: "10:00 PM" },
  { value: 23, label: "11:00 PM" }
];

export const Utilities = [
  "Gas",
  "Electricity",
  "Water",
  "Trash",
  "TV",
  "Internet"
];