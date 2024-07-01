import React from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

class PNRComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      PNRNumber: "",
      PNRDetails: [],
      PassengerStatus: [],
      OnButtonClicked: false,
      ErrorMessage: "",
      IsErrorOccurred: false
    };
  }

  handleChange = (event) => {
    this.setState({
      PNRNumber: event.target.value
    });
  };

  handleSubmit = () => {
    this.setState({
      PNRDetails: [],
      PassengerStatus: [],
      ErrorMessage:"",
      IsErrorOccurred:false
    });

    const options = {
      method: 'GET',
      url: 'https://irctc1.p.rapidapi.com/api/v3/getPNRStatus',
      params: { pnrNumber: this.state.PNRNumber },
      headers: {
        'X-RapidAPI-Key': '08d558a2f2msh89912308fa1d13fp16e322jsn23960f0abdbe',
        'X-RapidAPI-Host': 'irctc1.p.rapidapi.com'
      }
    };

    axios.request(options)
      .then(response => {
        this.setState({
          PNRDetails: response.data.data,
          PassengerStatus: response.data.data.PassengerStatus,
          OnButtonClicked: true
        });
      })
      .catch(error => {
        this.setState({
          ErrorMessage: "Please enter the correct PNR...",
          IsErrorOccurred: true
        });
      });
  };

  render() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-200">
        <Navbar/>
        <div className="app text-center">
          <h1 className="text-3xl font-bold mb-4">Engineer's Desk Railway Website</h1>
          <h3 className="text-xl mb-4">Please enter your PNR Number</h3>
          <div className="flex flex-col items-center">
            <input
              type="text"
              id="pnr"
              name="pnr"
              value={this.state.PNRNumber}
              onChange={this.handleChange}
              className="border border-gray-400 p-2 mb-2 rounded-md"
            />
            <button
              type="submit"
              onClick={this.handleSubmit}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
            >
              Search
            </button>
          </div>

          {this.state.IsErrorOccurred ? (
            <h5 className="text-red-600 mt-4">{this.state.ErrorMessage}</h5>
          ) : (
            this.state.OnButtonClicked && (
              <div className="mt-4">
                <div>
                  <table className="table-auto border-collapse border border-blue-500 mx-auto">
                    <thead>
                      <tr>
                        <th className="border border-blue-500 p-2">PNR Number</th>
                        <th className="border border-blue-500 p-2">Train Number</th>
                        <th className="border border-blue-500 p-2">Train Name</th>
                        <th className="border border-blue-500 p-2">Source Station</th>
                        <th className="border border-blue-500 p-2">Destination Station</th>
                        <th className="border border-blue-500 p-2">Date of Journey</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.Pnr}</td>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.TrainNo}</td>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.TrainName}</td>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.BoardingStationName}</td>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.ReservationUptoName}</td>
                        <td className="border border-blue-500 p-2">{this.state.PNRDetails.SourceDoj}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className="table-auto border-collapse border border-blue-500 mx-auto mt-4">
                    <thead>
                      <tr>
                        <th className="border border-blue-500 p-2">Person No.</th>
                        <th className="border border-blue-500 p-2">Coach</th>
                        <th className="border border-blue-500 p-2">Berth</th>
                        <th className="border border-blue-500 p-2">Booking Status</th>
                        <th className="border border-blue-500 p-2">Current Status</th>
                        <th className="border border-blue-500 p-2">Percentage Prediction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.PassengerStatus.map((passenger, index) => (
                        <tr key={index}>
                          <td className="border border-blue-500 p-2">{passenger.Number}</td>
                          <td className="border border-blue-500 p-2">{passenger.Coach}</td>
                          <td className="border border-blue-500 p-2">{passenger.Berth}</td>
                          <td className="border border-blue-500 p-2">{passenger.BookingStatus}</td>
                          <td className="border border-blue-500 p-2">{passenger.CurrentStatus}</td>
                          <td className="border border-blue-500 p-2">{passenger.PredictionPercentage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
}

export default PNRComponent;
