import React, { useState, useEffect } from 'react';
import CurrencyFormat from 'react-currency-format';
import { useSelector } from "react-redux";
import CircularProgress from '@material-ui/core/CircularProgress';

import AgencyWelcomeBarChart from '../Helpers/Charts/AgencyWelcomeBarChart';
import { RctCardFooter } from '../Helpers/RctCard';
import TinyPieChart from '../Helpers/Charts/TinyPieChart';
import HorizontalBarChart from '../Helpers/Charts/HorizontalBarChart';
import { ChartConfig } from '../Util/constants';
import RctCollapsibleCard from '../Helpers/RctCollapsibleCard/RctCollapsibleCard';
import * as homeApi from '../../Api/home';

const TopMainPage = () => {
    const login = useSelector((state) => state.login);
    const user = login.user;

    const propertyID = login.selectedPropertyID;
    const userFullname = `${user.firstName} ${user.lastName}`;

    const [ loading, setLoading ] = useState(true);
    const [ totalEarnedMonth, setTotalEarnedMonth ] = useState(0);
    const [ plSnapShot, setPlSnapShot ] = useState({
        grossIncome: 0.00,
        opeExpenses: 0.00,
        nonOpeExpenses: 0.00,
        netIncome: 0.00,
        grossPotencialRent: 0.00,
        lastMonthIncome: 0.00
    });

    const [ thisMonthPayment, setThisMonthPayments ] = useState({
        labels: [],
        data: [],
        color: 'blue'
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const last6MonthPay = await homeApi.getLast6MonthsPay(propertyID);
            let total = 0;
            let obj = {
                labels: [],
                data: [],
                color: 'blue'
            };
            for(const d of last6MonthPay) {
                obj.labels.push(d.date);    
                obj.data.push(d.amount);
                total += parseFloat(d.amount);
            }
            setThisMonthPayments(obj);
            setTotalEarnedMonth(parseFloat(total/6));

            const plSnap = await homeApi.getPLSnapshot(propertyID);
            setPlSnapShot({
                grossIncome: parseFloat(plSnap.GrossIncome || 0).toFixed(2),
                opeExpenses: parseFloat(plSnap.OperatingExpenses || 0).toFixed(2),
                nonOpeExpenses: parseFloat(plSnap.NonOperatingExpenses || 0).toFixed(2),
                netIncome: parseFloat(plSnap.NetIncome || 0).toFixed(2),
                grossPotencialRent: parseFloat(plSnap.GrossPotencialRent || 0).toFixed(2),
                lastMonthIncome: parseFloat(plSnap.LastMonthIncome || 0).toFixed(2)
            });
            setLoading(false);
        }
        fetchData();
    }, [propertyID]);

    const pieChart = {
        chartData: {
            labels: ['Gross Income', 'Operating Expenses', 'Non Operating Expenses'],
            datasets: [{
                data: [plSnapShot.grossIncome, plSnapShot.opeExpenses, plSnapShot.nonOpeExpenses],
                backgroundColor: [
                    ChartConfig.color.primary,
                    ChartConfig.color.warning,
                    ChartConfig.color.info
                ],
                hoverBackgroundColor: [
                    ChartConfig.color.primary,
                    ChartConfig.color.warning,
                    ChartConfig.color.info
                ]
            }]
        }
    };

    const horizontalChart = {
        label: 'Last Month Income',
        labels: ['Gross Potential Rent', 'Last Month Income'],
        chartdata: [plSnapShot.grossPotencialRent, plSnapShot.lastMonthIncome]
    };

    const greetings = (time) => {
        if(time < 12)
            return "morning";
        else if(time < 17)
            return "afternoon";
        else if(time < 20)
            return "evening";
        else
            return "night";
    };

    const renderTopMenu = () => {
        if(loading) {
            return (
                <div style={{justifyContent: 'center', display: 'flex', alignContent: 'center', marginBottom: '60px'}}>
                    <CircularProgress color="primary" />
                </div>
            );
        } else {
            const curTime = new Date().getHours();
            return (
                <div className="agency-welcome-block p-10 mb-30">
                    <div className="row">
                        <div className="col-lg-4 col-md-12">
                            {/* Add Weather Here */}
                            <div className="welcome-message">
                                <h2 className="fw-semi-bold">Good {greetings(curTime)}, {userFullname}.</h2>
                                <p>Income over last 6 months</p>
                                <br/>
                                <div className="welcome-chart row">
                                    <div className="col-lg-10">
                                        <span className="fw-semi-bold font-lg d-block mb-5">
                                            <CurrencyFormat value={totalEarnedMonth.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                            {' '}Average Income
                                        </span>
                                        <span className="d-block fs-12 mb-3"></span>
                                        <AgencyWelcomeBarChart
                                            data={thisMonthPayment.data}
                                            labels={thisMonthPayment.labels}
                                            color={thisMonthPayment.color}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-8 col-md-12">
                            <h3 align="center">PL Snapshot</h3>
                                <div className="row">
                                <div className="col-lg-6">
                                    <div className="charts-widgets-wrapper">
                                        <div className="dash-cards-lg">
                                            <div className="card">
                                                <h4 className="card-title">
                                                    Net Income: 
                                                    <CurrencyFormat value={plSnapShot.netIncome} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                                </h4>
                                                <div className="row">
                                                    <div className="col-sm-6 col-md-6 w-40 mx-auto">
                                                        <TinyPieChart
                                                            labels={pieChart.chartData.labels}
                                                            datasets={pieChart.chartData.datasets}
                                                            height={110}
                                                            width={100}
                                                        />
                                                    </div>
                                                    <div className="col-sm-6 align-self-center display-n">
                                                        <div className="clearfix mb-15">
                                                            <div className="float-left">
                                                                <span className="badge-primary ladgend">&nbsp;</span>
                                                            </div>
                                                            <div className="float-left">
                                                                <h3 className="mb-0">
                                                                    <CurrencyFormat value={plSnapShot.grossIncome} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                                                </h3>
                                                                <span className="text-dark fs-14">Gross Income</span>
                                                            </div>
                                                        </div>
                                                        <div className="clearfix mb-15">
                                                            <div className="float-left">
                                                                <span className="badge-warning ladgend">&nbsp;</span>
                                                            </div>
                                                            <div className="float-left">
                                                                <h3 className="mb-0">
                                                                    <CurrencyFormat value={plSnapShot.opeExpenses} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                                                </h3>
                                                                <span className="text-dark fs-14">Operating Expenses</span>
                                                            </div>
                                                        </div>
                                                        <div className="clearfix mb-15">
                                                            <div className="float-left">
                                                                <span className="badge-info ladgend">&nbsp;</span>
                                                            </div>
                                                            <div className="float-left">
                                                                <h3 className="mb-0">
                                                                    <CurrencyFormat value={plSnapShot.nonOpeExpenses} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                                                </h3>
                                                                <span className="text-dark fs-14">Non Operating Expenses</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                <RctCollapsibleCard
                                    heading={horizontalChart.label}
                                    customClasses="overflow-hidden"
                                    colClasses="col-sm-12 w-xs-half-block"
                                    fullBlock
                                >
                                    <div className="sales-chart-wrap">
                                        <div className="p-15">
                                            <HorizontalBarChart
                                                label={horizontalChart.label}
                                                chartdata={horizontalChart.chartdata}
                                                labels={horizontalChart.labels}
                                                height={168}
                                                max={plSnapShot.grossPotencialRent}
                                            />
                                        </div>
                                        <RctCardFooter customClasses="d-flex justify-content-between align-items-center">
                                            <p>
                                                Gross Potential Rent: <CurrencyFormat value={plSnapShot.grossPotencialRent} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                                <br/>
                                                Last Month Income: <CurrencyFormat value={plSnapShot.lastMonthIncome} displayType={'text'} thousandSeparator={true} prefix={'$'} />
                                            </p>
                                        </RctCardFooter >
                                    </div>
                                </RctCollapsibleCard>
                                </div>
                                </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return renderTopMenu();
}

export default TopMainPage;