// vite.config.js
import { defineConfig } from "file:///D:/Documentos%20D/Documentos%20Yoe/BeZhas/BeZhas%20Web/bezhas-web3/frontend/node_modules/.pnpm/vite@5.4.21_@types+node@22.7.5_terser@5.46.0/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Documentos%20D/Documentos%20Yoe/BeZhas/BeZhas%20Web/bezhas-web3/frontend/node_modules/.pnpm/@vitejs+plugin-react@4.7.0__92b32997971697bfc87aa013dd144ab8/node_modules/@vitejs/plugin-react/dist/index.js";
import { nodePolyfills } from "file:///D:/Documentos%20D/Documentos%20Yoe/BeZhas/BeZhas%20Web/bezhas-web3/frontend/node_modules/.pnpm/vite-plugin-node-polyfills@_815453cc6319f794d253b878f1639854/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { VitePWA } from "file:///D:/Documentos%20D/Documentos%20Yoe/BeZhas/BeZhas%20Web/bezhas-web3/frontend/node_modules/.pnpm/vite-plugin-pwa@1.2.0_vite@_b67f6379163c126c5fdbce3fafc8e42f/node_modules/vite-plugin-pwa/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "D:\\Documentos D\\Documentos Yoe\\BeZhas\\BeZhas Web\\bezhas-web3\\frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "apple-touch-icon.png"],
      manifest: {
        name: "BeZhas - Social Crypto Platform",
        short_name: "BeZhas",
        description: "La red social descentralizada para la econom\xEDa del futuro",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@sdk": path.resolve(__vite_injected_original_dirname, "../sdk")
    }
  },
  define: {
    // 'process.env': {}, // Removed to avoid breaking libraries
    global: "globalThis"
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis"
      }
    }
    // include: ['buffer', 'process'] // Handled by plugin
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      // Optimizar HMR para reducir refrescos innecesarios
      overlay: true,
      timeout: 5e3
    },
    watch: {
      // Reducir la sensibilidad del file watcher
      usePolling: false,
      interval: 1e3,
      // Check every 1 second instead of continuously
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"]
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none"
      // Removemos CSP para permitir que WalletConnect funcione sin restricciones
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxEb2N1bWVudG9zIERcXFxcRG9jdW1lbnRvcyBZb2VcXFxcQmVaaGFzXFxcXEJlWmhhcyBXZWJcXFxcYmV6aGFzLXdlYjNcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXERvY3VtZW50b3MgRFxcXFxEb2N1bWVudG9zIFlvZVxcXFxCZVpoYXNcXFxcQmVaaGFzIFdlYlxcXFxiZXpoYXMtd2ViM1xcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovRG9jdW1lbnRvcyUyMEQvRG9jdW1lbnRvcyUyMFlvZS9CZVpoYXMvQmVaaGFzJTIwV2ViL2Jlemhhcy13ZWIzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICAvLyBXaGV0aGVyIHRvIHBvbHlmaWxsIGBub2RlOmAgcHJvdG9jb2wgaW1wb3J0cy5cbiAgICAgIHByb3RvY29sSW1wb3J0czogdHJ1ZSxcbiAgICB9KSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydsb2dvLnBuZycsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0JlWmhhcyAtIFNvY2lhbCBDcnlwdG8gUGxhdGZvcm0nLFxuICAgICAgICBzaG9ydF9uYW1lOiAnQmVaaGFzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdMYSByZWQgc29jaWFsIGRlc2NlbnRyYWxpemFkYSBwYXJhIGxhIGVjb25vbVx1MDBFRGEgZGVsIGZ1dHVybycsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzBmMTcyYScsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMGYxNzJhJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3B3YS0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnL3B3YS01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdvZmYyfSddLFxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nb29nbGVhcGlzXFwuY29tXFwvLiovaSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ29vZ2xlLWZvbnRzLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2FwaVxcLmNvaW5nZWNrb1xcLmNvbVxcLy4qL2ksXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnYXBpLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgJ0BzZGsnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vc2RrJylcbiAgICB9XG4gIH0sXG4gIGRlZmluZToge1xuICAgIC8vICdwcm9jZXNzLmVudic6IHt9LCAvLyBSZW1vdmVkIHRvIGF2b2lkIGJyZWFraW5nIGxpYnJhcmllc1xuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnXG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGVzYnVpbGRPcHRpb25zOiB7XG4gICAgICBkZWZpbmU6IHtcbiAgICAgICAgZ2xvYmFsOiAnZ2xvYmFsVGhpcydcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIGluY2x1ZGU6IFsnYnVmZmVyJywgJ3Byb2Nlc3MnXSAvLyBIYW5kbGVkIGJ5IHBsdWdpblxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiB0cnVlLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIC8vIE9wdGltaXphciBITVIgcGFyYSByZWR1Y2lyIHJlZnJlc2NvcyBpbm5lY2VzYXJpb3NcbiAgICAgIG92ZXJsYXk6IHRydWUsXG4gICAgICB0aW1lb3V0OiA1MDAwLFxuICAgIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIC8vIFJlZHVjaXIgbGEgc2Vuc2liaWxpZGFkIGRlbCBmaWxlIHdhdGNoZXJcbiAgICAgIHVzZVBvbGxpbmc6IGZhbHNlLFxuICAgICAgaW50ZXJ2YWw6IDEwMDAsIC8vIENoZWNrIGV2ZXJ5IDEgc2Vjb25kIGluc3RlYWQgb2YgY29udGludW91c2x5XG4gICAgICBpZ25vcmVkOiBbJyoqL25vZGVfbW9kdWxlcy8qKicsICcqKi8uZ2l0LyoqJywgJyoqL2Rpc3QvKionXVxuICAgIH0sXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JzogJ3NhbWUtb3JpZ2luLWFsbG93LXBvcHVwcycsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICd1bnNhZmUtbm9uZScsXG4gICAgICAvLyBSZW1vdmVtb3MgQ1NQIHBhcmEgcGVybWl0aXIgcXVlIFdhbGxldENvbm5lY3QgZnVuY2lvbmUgc2luIHJlc3RyaWNjaW9uZXNcbiAgICB9LFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAxJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aCxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVosU0FBUyxvQkFBb0I7QUFDbGIsT0FBTyxXQUFXO0FBQ2xCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBO0FBQUEsTUFFWixpQkFBaUI7QUFBQSxJQUNuQixDQUFDO0FBQUEsSUFDRCxRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsWUFBWSxzQkFBc0I7QUFBQSxNQUNsRCxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDTDtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsc0NBQXNDO0FBQUEsUUFDckQsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUEsY0FDaEM7QUFBQSxjQUNBLG1CQUFtQjtBQUFBLGdCQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsY0FDbkI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLO0FBQUEsY0FDdEI7QUFBQSxjQUNBLG1CQUFtQjtBQUFBLGdCQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsY0FDbkI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFFBQVEsS0FBSyxRQUFRLGtDQUFXLFFBQVE7QUFBQSxJQUMxQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQTtBQUFBLElBRU4sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxFQUVGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUE7QUFBQSxNQUVILFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxNQUVMLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQTtBQUFBLE1BQ1YsU0FBUyxDQUFDLHNCQUFzQixjQUFjLFlBQVk7QUFBQSxJQUM1RDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUE7QUFBQSxJQUVsQztBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDQSxVQUFTQTtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
