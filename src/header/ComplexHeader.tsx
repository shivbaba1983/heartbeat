import './ComplexHeader.scss';
import lord from './../assets/lord.jpg';
import brahmabrahmakumari_logo from './../assets/brahmakumari_logo.jpg';
const ComplexHeader =()=>{

    return(<div>
  
        <div className="complex-headline">
        <h1> <img src={lord} className="lord-image"/> शिव शक्ती संकुल, कोल्हार - बेलापूर रोड , कडीत खुर्द <img src={brahmabrahmakumari_logo} className="brahmakumari-logo"/></h1>
        </div>
    </div>)
}

export default ComplexHeader;