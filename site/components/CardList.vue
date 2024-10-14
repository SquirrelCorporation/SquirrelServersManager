<template>
  <v-container class="full-width-container" fluid>
    <v-row align="center" justify="center" dense>
      <v-col
        v-for="template in templates"
        :key="template.name"
        cols="12"
        md="4"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <transition
              name="fade-in"
              @before-enter="beforeEnter"
              @enter="enter"
            >
              <v-card
                v-bind="attrs"
                v-on="on"
                class="template-card"
                :prepend-avatar="template.logo"
                v-intersect="onIntersect"
              >
                <template v-slot:title>{{ template.title }}</template>
                <template v-slot:subtitle v-for="category in template.categories" :key="category">{{ category }}</template>
                <v-card-text class="description">
                  {{ template.description }}

                </v-card-text>
                <template v-slot:actions>
                  <a href="/docs/quickstart/">
                  <v-btn text="Deploy using SSM"></v-btn>
                  </a>
                </template>
              </v-card>
            </transition>
          </template>
          <span>{{ template.description }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      templates: [],
      isIntersecting: []
    };
  },
  mounted() {
    this.fetchTemplates();
  },
  methods: {
    async fetchTemplates() {
      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/SquirrelCorporation/SquirrelServersManager/refs/heads/master/server/src/data/static/templates.json"
        );
        this.templates = response.data.templates;
        this.isIntersecting = new Array(this.templates.length).fill(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    },
    onIntersect(entries, observer, index) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.$set(this.isIntersecting, index, true);
        }
      });
    },
    beforeEnter(el) {
      el.style.opacity = 0;
      el.style.transform = 'translateY(30px)';
    },
    enter(el, done) {
      const delay = el.dataset.index * 100;
      setTimeout(() => {
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
        done();
      }, delay);
    }
  }
};
</script>

<style scoped>
.full-width-container {
  width: 90% !important;
  margin-right: 80px !important;
  margin-left: 80px !important;
  margin-top: 40px !important;
  padding: 0 !important;
}

.template-card {
  margin-bottom: 20px;
  padding: 20px;
  height: 300px; /* Fixed height for consistent size */
  display: flex;
  flex-direction: column;
  background-color: rgb(22, 22, 24); /* Black background */
  color: #fff; /* White text */
}

.fade-in-enter-active,
.fade-in-leave-active {
  transition: opacity 1s, transform 1s;
}

.fade-in-enter, .fade-in-leave-to /* .fade-in-leave-active in <2.1.8 */ {
  opacity: 0;
  transform: translateY(30px);
}

.description {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* Number of lines to display */
  -webkit-box-orient: vertical;
  height: 100px; /* Adjust height as necessary */
}

.v-card-title, .v-card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff; /* White text */
}

.v-card-text, .v-card-text {
  font-size: 0.8rem;
  color: #fff; /* White text */
}
</style>
