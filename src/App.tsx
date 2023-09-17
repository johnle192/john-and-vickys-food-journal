import './App.css'
import {Card, CardContent, Grid, Typography} from "@mui/material";
import RestaurantCard from "./components/RestaurantCard.tsx";

function App() {
  return (
    <div>
      {/*<CardHeader>*/}
      {/*  Lorem Ipsem*/}
      {/*</CardHeader>*/}

      <Grid
        container
        spacing={2}
        direction="column"
        justifyContent="space-evenly"
        alignItems="center"
      >
        {/*TODO: add data and iterate*/}
        <RestaurantCard />
      </Grid>
    </div>
  )
}

export default App
