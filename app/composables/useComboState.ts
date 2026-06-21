import { ref } from 'vue'

export const useComboState = () => {
  const showCatalog = useState<boolean>('showCatalog', () => false)
  const showCity = useState<boolean>('showCity', () => false)
  const showReg = useState<boolean>('showReg', () => false)
  const showLogin = useState<boolean>('showLogin', () => false)
  const showAbout = useState<boolean>('showAbout', () => false)
  const showOrder = useState<boolean>('showOrder', () => false)
  const showSupport = useState<boolean>('showSupport', () => false)

  const selectedCategory = useState<any>('selectedCategory', () => null)
  const selectedProduct = useState<any>('selectedProduct', () => null)
  const selectedPromo = useState<any>('selectedPromo', () => null)

  const currentCity = useState<string>('currentCity', () => 'МОСКВА')

  return {
    showCatalog,
    showCity,
    showReg,
    showLogin,
    showAbout,
    showOrder,
    showSupport,
    selectedCategory,
    selectedProduct,
    selectedPromo,
    currentCity
  }
}
