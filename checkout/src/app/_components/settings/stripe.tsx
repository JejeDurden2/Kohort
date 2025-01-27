export const appearance = {
  labels: 'floating' as const,
  variables: {
    fontFamily: '"Poppins", sans-serif',
    fontSizeBase: '16px',
    colorPrimary: '#ED395E',
    colorText: '#170D2C',
    fontSizeSm: '12px',
    colorDanger: '#DC2626',
  },
  rules: {
    '.Label--empty': {
      opacity: '0.3',
    },
  },
}
