/**
 * App Light Theme
 */
import { createMuiTheme } from '@material-ui/core/styles';
import * as Constants from '../components/Util/constants';

const theme = createMuiTheme({
   palette: {
      primary: {
         main: Constants.themeColors.primary
      },
      secondary: {
         main: Constants.themeColors.warning
      }
   },
   typography: {
      useNextVariants: true,
      // Use the system font instead of the default Roboto font.
      fontFamily: [
         "Roboto",
         "Helvetica",
         "Arial",
         'Heebo',
         'sans-serif',
      ].join(','),
      htmlFontSize: 16,
      h2: {
         fontSize: 21,
         fontWeight: 400,
      },
      body1: {
         fontWeight: 400,
      },
   },

});

export default theme;