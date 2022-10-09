import React from 'react';

import Main from '../Main';
import TopMainPage from './TopMainPage';
import VacancySnapshot from './VacancySnapshot';
import ActionItems from './ActionItems';
import WorkOrdersSnapshot from './WorkOrdersSnapshot';
import ConcessionRequest from './ConcessionRequest';
import LeaseAudit from './LeaseAudit';
import SecurityDeposit from './SecurityDeposit';
import MissedPromissPay from './MissedPromise';
import DelinquenciesOver from './DelinquenciesOver';

const Home = () => {
    return (
        <Main>
            <div className="rct-page-content" style={{marginBottom: '30px'}}>
                <TopMainPage />

                <div className="blank-wrapper">
                    <div className="row">
                        <VacancySnapshot />
                        <ActionItems />
                    </div>

                    <div className="row">
                        <WorkOrdersSnapshot />
                        <ConcessionRequest />
                    </div>

                    <div className="row">
                        <LeaseAudit />
                        <SecurityDeposit />
                    </div>

                    <div className="row">
                        <MissedPromissPay />
                        <DelinquenciesOver />
                    </div>

                    <div className="row" style={{paddingBottom: '20px'}}></div>
                </div>
            </div>
        </Main>
    );
}

export default Home;