import React, { Component } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { connect } from "react-redux";
import { getMyOpportunities } from "../redux/actions";
import RBSheet from "react-native-raw-bottom-sheet";
import axios from "axios";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

class Attending extends Component {
  componentDidMount() {
    this.props.getMyOpportunities();
  }

  state = {
    selectedId: 0,
    location: null
  };

  formatDate = time => {
    const date = new Date(time);
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC"
    ]; // todo optimize ples
    const now = new Date();
    const days = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY"
    ];
    const daysToDate = Math.round((date - now) / (1000 * 60 * 60 * 24));
    if (daysToDate < 7 && daysToDate !== 0) {
      return days[date.getDay()];
    } else if (now > date) {
      return "NOW";
    } else if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return "TODAY";
    } else {
      return `${months[date.getMonth()]} ${date.getDate()}`;
    }
  };

  renderInput = () => {
    if (this.props.opportunity.myOpportunities[this.state.selectedId]) {
      let qr = false;

      for (
        let i = 0;
        i <
        this.props.opportunity.myOpportunities[this.state.selectedId].volunteers
          .length;
        i++
      ) {
        if (
          this.props.opportunity.myOpportunities[
            this.state.selectedId
          ].volunteers[i].volunteer.toLowerCase() ==
            this.props.auth.user.address.toLowerCase() &&
          this.props.opportunity.myOpportunities[this.state.selectedId]
            .volunteers[i][2]
        ) {
          return (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10
              }}
            >
              <Text style={{ color: "white", fontSize: 20 }}>
                Thanks for volunteering!
              </Text>
            </View>
          );
        }

        if (
          this.props.opportunity.myOpportunities[
            this.state.selectedId
          ].volunteers[i].volunteer.toLowerCase() ==
            this.props.auth.user.address.toLowerCase() &&
          this.props.opportunity.myOpportunities[this.state.selectedId]
            .volunteers[i][0]
        ) {
          qr = true;
          break;
        }
      }

      if (qr) {
        return (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10
            }}
          >
            <Input
              placeholder="Hours"
              inputStyle={{ color: "white" }}
              onChangeText={text => {
                this.setState({ text });
              }}
            />
            <Button
              title={this.state.location ? "Uploaded" : "Attach Location"}
              style={{ marginTop: 10 }}
              titleStyle={{ color: "#e3125c" }}
              buttonStyle={{
                backgroundColor: "transparent"
              }}
              onPress={async () => {
                let { status } = await Permissions.askAsync(
                  Permissions.LOCATION
                );
                let location = await Location.getCurrentPositionAsync({});
                this.setState({ location });
              }}
            />

            <Button
              title="Record"
              style={{ marginTop: 10 }}
              buttonStyle={{ backgroundColor: "#e3125c" }}
              onPress={async () => {
                const { data } = await axios.get(
                  `https://api.opencagedata.com/geocode/v1/json?q=${this.state.location.coords.latitude}+${this.state.location.coords.longitude}&key=237eddf069a14bba99f0968b55c075b8`
                );

                await axios({
                  method: "post",
                  url: "https://4de8e0fc.ngrok.io/api/opportunity/record",
                  data: {
                    address: this.props.opportunity.myOpportunities[
                      this.state.selectedId
                    ].address,
                    time: Number(this.state.text) * 3600,
                    endLocation: data.results[0].formatted
                  }
                });
                this.RBSheet.close();
              }}
            />
          </View>
        );
      } else {
        return (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10
            }}
          >
            <Image
              style={{ width: 150, height: 150 }}
              source={{
                uri: this.props.opportunity.myOpportunities[
                  this.state.selectedId
                ][3]
              }}
            />
          </View>
        );
      }
    }
  };

  renderOpportunities = () => {
    return this.props.opportunity.myOpportunities.map((opportunity, id) => (
      <TouchableOpacity
        style={{
          flexDirection: "row",
          marginTop: 10,
          marginBottom: 10,
          justifyContent: "space-between",
          marginRight: 10,
          marginLeft: 10
        }}
        onPress={() => {
          this.setState({ selectedId: id });
          this.RBSheet.open();
        }}
      >
        <View
          style={{
            backgroundColor: "#1a1b51",
            borderRadius: 8,
            height: "40%",
            justifyContent: "center",
            marginTop: 10
          }}
        >
          <Text
            style={{
              color: "#e3125c",
              padding: 10,
              fontWeight: "bold",
              fontSize: 15
            }}
          >
            {this.formatDate(opportunity[7])}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "#e3125c",
            width: "65%",
            borderRadius: 15
          }}
        >
          <View style={{ flexDirection: "column", padding: 10 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 25,
                fontWeight: "bold"
              }}
              numberOfLines={2}
            >
              {opportunity[0]}
            </Text>
            <Text
              style={{ color: "#f0f3fa", fontSize: 15, fontWeight: "bold" }}
            >
              {opportunity[2]}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "black"
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
            marginTop: 25,
            marginLeft: 25
          }}
        >
          Attending
        </Text>

        <ScrollView style={{}}>{this.renderOpportunities()}</ScrollView>

        <RBSheet
          ref={ref => {
            this.RBSheet = ref;
          }}
          duration={250}
          animationType={"slide"}
          closeOnDragDown={true}
          height={500}
          duration={250}
          customStyles={{
            container: {
              backgroundColor: "black"
            }
          }}
        >
          {this.props.opportunity.myOpportunities.length > 0 ? (
            <View
              style={{
                flexDirection: "column",
                padding: 20,
                textAlign: "left"
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 30 }}
              >
                {
                  this.props.opportunity.myOpportunities[
                    this.state.selectedId
                  ][0]
                }
              </Text>
              <Text style={{ color: "white", fontSize: 15 }}>
                {
                  this.props.opportunity.myOpportunities[
                    this.state.selectedId
                  ][1]
                }
              </Text>

              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 10
                }}
              >
                Location:
              </Text>
              <Text style={{ color: "white", fontSize: 15 }}>
                {
                  this.props.opportunity.myOpportunities[
                    this.state.selectedId
                  ][2]
                }
              </Text>

              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 10
                }}
              >
                Date:
              </Text>
              <Text style={{ color: "white", fontSize: 15 }}>
                {
                  this.props.opportunity.myOpportunities[
                    this.state.selectedId
                  ][7]
                }
              </Text>

              {this.renderInput()}
            </View>
          ) : null}
        </RBSheet>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { opportunity, auth } = state;
  return { opportunity, auth };
};

export default connect(
  mapStateToProps,
  { getMyOpportunities }
)(Attending);
