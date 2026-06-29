import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import './assets/transitions.css'
import App from './App.vue'
import router from './router'
import { createSupabaseDataLayer, provideDataLayer } from './services'

// Configura il data layer attivo.
// Questa è l'UNICA riga da cambiare per sostituire Supabase con un altro backend
// (es. ASP.NET Core): basta fornire un'altra implementazione di DataLayer.
provideDataLayer(createSupabaseDataLayer())

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
