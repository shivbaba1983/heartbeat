import { TWOQuarterlyOpenInterest } from './TWOQuarterlyOpenInterest';
import { DynamicTickerOptionTable } from './DynamicTickerOptionTable'
const QuarterlyDashboard = () => {

    return (
        <div>
            <p>Welcome, This Analytics Dashboard page</p>
            <div>
                <DynamicTickerOptionTable />
                <TWOQuarterlyOpenInterest />
            </div>
        </div>
    );
};

export default QuarterlyDashboard;
