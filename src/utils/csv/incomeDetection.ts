
export const isPositiveIncome = (description: string): boolean => {
  const incomeKeywords = [
    'UPLATA', 'PRENOS', 'TRANSFER', 'SALARY', 'PAYMENT',
    'Upwork', 'FREELANCE', 'CLIENT', 'Invoice', 'OIP'
  ];
  
  return incomeKeywords.some(keyword => 
    description.toUpperCase().includes(keyword.toUpperCase())
  );
};
