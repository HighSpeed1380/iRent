/**
 * App Info Theme
 */
import { createMuiTheme } from '@material-ui/core/styles';
import * as Constants from '../components/Util/constants';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: Constants.themeColors.info
        },
        secondary: {
            main: Constants.themeColors.primary
        }
    }
});

export default theme;