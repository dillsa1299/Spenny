/** True when the SPA was built for the self-hosted development deployment (see VITE_DEPLOYMENT_ENV). */
export function isDevelopmentDeployment(): boolean {
  return import.meta.env.VITE_DEPLOYMENT_ENV === 'development'
}
