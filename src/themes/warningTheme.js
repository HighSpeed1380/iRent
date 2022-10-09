/**
 * App Warning Theme
 */
import { createMuiTheme } from '@material-ui/core/styles';
import * as Constants from '../components/Util/constants';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: Constants.themeColors.warning
        },
        secondary: {
            main: Constants.themeColors.primary
        }
    }
});

export default theme;