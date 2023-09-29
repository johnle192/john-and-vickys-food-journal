import { Card, CardContent, Divider, Typography } from '@mui/material';

export default function RestaurantCard() {
  return (
    <Card sx={{ maxWidth: 600 }}>
      <CardContent sx={{ justifyContent: 'left' }}>
        <Typography variant="h5" component="div">
          Ramen
        </Typography>
        <Divider />
        {/* TODO: fix the margins on this */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ marginTop: '10px', marginBottom: '4px' }}
        >
          Hits the spot, John had tonkotsu, Vicky had shoyu, def get the
          takoyaki, can't go wrong with karage
        </Typography>
        <Typography variant="body2" color="text.tertiary">
          Cuisine: Japanese
        </Typography>
      </CardContent>
    </Card>
  );
}
