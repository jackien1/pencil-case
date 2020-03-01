import React, { Component } from "react";
import { View, Text } from "react-native";
import { Input, Button, Icon } from "react-native-elements";
import { connect } from "react-redux";
import { getOpportunities } from "../redux/actions";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";
import RBSheet from "react-native-raw-bottom-sheet";
import axios from "axios";

class Home extends Component {
  componentDidMount() {
    this.props.getOpportunities();
  }

  state = {
    selectedId: 0
  };

  renderMarkers = () => {
    if (this.props.opportunity.opportunities.length > 0) {
      return this.props.opportunity.opportunities.map((marker, id) => {
        return (
          <Marker
            coordinate={marker.coordinate}
            title={marker[0]}
            description={marker[1]}
            image={"https://i.imgur.com/B2o3n0P.png"}
            key={id}
            onCalloutPress={() => {
              this.setState({ selectedId: id });
              this.RBSheet.open();
            }}
          ></Marker>
        );
      });
    }
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black"
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 20
          }}
        >
          Opportunities
        </Text>
        <MapView
          region={{
            latitude: 33.787914,
            longitude: -117.853104,
            latitudeDelta: 1,
            longitudeDelta: 1
          }}
          style={{ width: 350, height: 350 }}
        >
          {this.renderMarkers()}
        </MapView>

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
          {this.props.opportunity.opportunities.length > 0 ? (
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
                {this.props.opportunity.opportunities[this.state.selectedId][0]}
              </Text>
              <Text style={{ color: "white", fontSize: 15 }}>
                {this.props.opportunity.opportunities[this.state.selectedId][1]}
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
                {this.props.opportunity.opportunities[this.state.selectedId][2]}
              </Text>

              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginTop: 10
                }}
              >
                Volunteers Needed:
              </Text>
              <Text style={{ color: "white", fontSize: 15 }}>
                {this.props.opportunity.opportunities[
                  this.state.selectedId
                ][4] -
                  this.props.opportunity.opportunities[this.state.selectedId][6]
                    .length}
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
                {this.props.opportunity.opportunities[this.state.selectedId][7]}
              </Text>

              {this.props.opportunity.opportunities[this.state.selectedId]
                .volunteer ? null : (
                <View style={{ alignItems: "flex-end", marginTop: 20 }}>
                  <Button
                    title="Volunteer"
                    buttonStyle={{ backgroundColor: "#e3125c" }}
                    onPress={async () => {
                      await axios({
                        method: "post",
                        url:
                          "https://4de8e0fc.ngrok.io/api/opportunity/joinOpportunity",
                        data: {
                          address: this.props.opportunity.opportunities[
                            this.state.selectedId
                          ].address
                        }
                      });
                      this.RBSheet.close();
                    }}
                  />
                </View>
              )}
            </View>
          ) : null}
        </RBSheet>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const { opportunity } = state;
  return { opportunity };
};

export default connect(
  mapStateToProps,
  { getOpportunities }
)(Home);
