<template>
  <swiper
      :space-between="50"
      :autoplay="{
      delay: 4000,
      disableOnInteraction: false,
    }"
      :modules="modules"
  >
    <swiper-slide class="slide">
      <img src="/devices.png" alt="Devices" class="background-image"/>
      <div class="text-overlay">
        <div class="title">Devices</div>
        <div class="subtitle">Manage all your devices effortlessly</div>
      </div>
    </swiper-slide>
    <swiper-slide class="slide">
      <img src="/services.png" alt="Containers" class="background-image"/>
      <div class="text-overlay">
        <div class="title">Containers</div>
        <div class="subtitle">Monitor and manage your containers seamlessly</div>
      </div>
    </swiper-slide>
    <swiper-slide class="slide">
      <img src="/home/dashboard.png" alt="Dashboard" class="background-image"/>
      <div class="text-overlay">
        <div class="title">Dashboard</div>
        <div class="subtitle">Track CPU and memory usage efficiently</div>
      </div>
    </swiper-slide>
    <swiper-slide class="slide">
      <img src="/services/deploy-store.png" alt="Deploy" class="background-image"/>
      <div class="text-overlay">
        <div class="title">Deploy</div>
        <div class="subtitle">Deploy containers to your devices effortlessly</div>
      </div>
    </swiper-slide>
    <swiper-slide class="slide">
      <img src="/add-device/add-device-2.png" alt="Add Device" class="background-image"/>
      <div class="text-overlay">
        <div class="title">Add Device</div>
        <div class="subtitle">Add devices with ease</div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script>
import { Autoplay } from 'swiper/modules';
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';

// Import Swiper styles
import 'swiper/css';

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    return {
      modules: [Autoplay],
    };
  }
};
</script>

<style scoped>
.slide {
  position: relative;
  width: 300px;
  height: 300px;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15px; /* Round the edges of the image */
  transform: scale(1.05); /* Slight zoom-in effect */
}

.text-overlay {
  position: absolute;
  bottom: 5px; /* Add some space from the bottom edge */
  left: 10px; /* Add some space from the left edge */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align text to the start (left) */
  text-align: left;
  color: white;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  border-radius: 8px; /* Rounded edges */
  padding: 20px; /* Increase padding to make the background larger */
}


.title {
  font-size: 25px;
  font-weight: 300;
  margin-bottom: 10px; /* Add space between title and subtitle */
}

.subtitle {
  font-size: 18px;
}
</style>
