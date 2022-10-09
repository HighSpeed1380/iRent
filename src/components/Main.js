import React, { useState } from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { Scrollbars } from 'react-custom-scrollbars';
import { IntlProvider } from 'react-intl';

// lang
import AppLocale from './lang';

import Header from './Header/Header';
import HorizontalMenu from './HorizontalMenu/HorizontalMenu';

// themes
import primaryTheme from '../themes/primaryTheme';
/*
import darkTheme from '../themes/darkTheme';
import secondaryTheme from '../themes/secondaryTheme';
import warningTheme from '../themes/warningTheme';
import dangerTheme from '../themes/dangerTheme';
import infoTheme from '../themes/infoTheme';
import successTheme from '../themes/successTheme';
*/

const getScrollBarStyle = () => {
    return {
        height: 'calc(100vh - 100px)'
    }
}

const Main = (props) => {
    const [ theme, setTheme ] = useState(primaryTheme);
    const currentAppLocale = AppLocale['en'];  // default to English. We can have a redux for other languages

    theme.direction = 'rtl';
    return (
        <MuiThemeProvider theme={theme}>
            <IntlProvider
                locale={currentAppLocale.locale}
                messages={currentAppLocale.messages}
            >
                <div className="app-horizontal collapsed-sidebar">
                    {/* SideBar Here */}
                    <div className="app-container">
                        <div className="rct-page-wrapper">
                            <div className="rct-app-content">
                                <Header />

                                <div className="rct-page">
                                    <HorizontalMenu />
                                    <Scrollbars
                                        className="rct-scroll"
                                        autoHide
                                        autoHideDuration={100}
                                        style={getScrollBarStyle()}
                                    >
                                        {props.children}
                                    </Scrollbars>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </IntlProvider>
        </MuiThemeProvider>
    );
}

export default Main;