import {Card, CardContent, Divider, Grid, Typography} from "@mui/material";

export default function RestaurantCard() {
  return(
    <Grid item xs={6}>
      <Card sx={{maxWidth: 345}}>
        <CardContent sx={{justifyContent: "left"}}>
          <Typography variant="h5" component="div">
            Ramen
          </Typography>
          <Divider/>
          <Typography variant="body1" color="text.secondary" sx={{marginTop: "10px"}}>
            Hits the spot, John had tonkotsu, Vicky had shoyu, def get the takoyaki,
            can't go wrong with karage
          </Typography>
          <Typography variant="body2" color="text.tertiary">
            Cuisine: Japanese
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}