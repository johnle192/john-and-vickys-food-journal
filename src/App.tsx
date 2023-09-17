import './App.css';
import { Stack } from '@mui/material';
import RestaurantCard from './components/RestaurantCard.tsx';

function App() {
  return (
    <div>
      <Stack spacing={2}>
        {/*TODO: add data and iterate*/}
        <RestaurantCard />
        <RestaurantCard />
        <RestaurantCard />
      </Stack>
    </div>
  );
}

export default App;
