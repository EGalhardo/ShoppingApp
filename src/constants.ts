export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  type: 'Casual' | 'Formal' | 'Desportivo';
  rating?: number;
  stock?: number;
}

export interface Order {
  id: string;
  product: Product;
  status: 'completed' | 'pending';
  date: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  balance: number;
  type: 'card' | 'cash';
  lastFour?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Jaqueta Bamber',
    category: 'Homem',
    price: 60,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop',
    description: 'Adquira já esta peça de vestuário única, projetada para oferecer conforto, estilo e durabilidade.',
    type: 'Casual',
    rating: 4.5
  },
  {
    id: '5',
    name: 'Blusa Azul Sky',
    category: 'Mulher',
    price: 80,
    image: 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?q=80&w=800&auto=format&fit=crop',
    description: 'Conforto e leveza para o dia a dia.',
    type: 'Casual',
    rating: 4.4
  },
  {
    id: '12',
    name: 'Hoodie Desportivo',
    category: 'Rapaz',
    price: 40,
    image: 'https://images.unsplash.com/photo-1511210203372-88229bd63283?q=80&w=800&auto=format&fit=crop',
    description: 'Estilo urbano para os mais novos.',
    type: 'Desportivo',
    rating: 4.1
  },
  {
    id: '22',
    name: 'Body Algodão',
    category: 'Bebé',
    price: 15,
    image: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?q=80&w=800&auto=format&fit=crop',
    description: 'Suavidade máxima para a pele do bebé.',
    type: 'Casual',
    rating: 4.9
  },
  {
    id: '8',
    name: 'Vestido Floral',
    category: 'Mulher',
    price: 120,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop',
    description: 'Elegância para dias ensolarados.',
    type: 'Casual',
    rating: 4.7
  },
  {
    id: '2',
    name: 'Jaqueta Carm.',
    category: 'Homem',
    price: 60,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    description: 'Estilo e elegância em uma só peça.',
    type: 'Casual',
    rating: 4.2
  },
  {
    id: '25',
    name: 'Fato Meia-estação',
    category: 'Bebé',
    price: 35,
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop',
    description: 'Proteção ideal para o tempo instável.',
    type: 'Casual',
    rating: 4.6
  },
  {
    id: '17',
    name: 'Vestido Tule',
    category: 'Rapariga',
    price: 45,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop',
    description: 'Mágico e delicado.',
    type: 'Formal',
    rating: 4.8
  },
  {
    id: '13',
    name: 'T-shirt Graphic',
    category: 'Rapaz',
    price: 25,
    image: 'https://images.unsplash.com/photo-1519238263530-99bbe197c904?q=80&w=800&auto=format&fit=crop',
    description: 'Cores vibrantes e diversão.',
    type: 'Casual',
    rating: 4.0
  },
  {
    id: '3',
    name: 'Casaco Suite',
    category: 'Homem',
    price: 60,
    image: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68e?q=80&w=800&auto=format&fit=crop',
    description: 'Para ocasiões formais e sofisticadas.',
    type: 'Formal',
    rating: 4.8
  },
  {
    id: '4',
    name: 'Fato Suite Completo',
    category: 'Homem',
    price: 60,
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800&auto=format&fit=crop',
    description: 'O conjunto perfeito para o homem moderno.',
    type: 'Formal',
    rating: 4.9
  },
  {
    id: '6',
    name: 'Sapato Social',
    category: 'Homem',
    price: 80,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop',
    description: 'Elegância em cada passo.',
    type: 'Formal',
    rating: 4.6
  },
  {
    id: '9',
    name: 'Sobretudo Bege',
    category: 'Mulher',
    price: 150,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop',
    description: 'Peça essencial para o inverno.',
    type: 'Formal',
    rating: 4.9
  },
  {
    id: '10',
    name: 'Blazer Modern',
    category: 'Mulher',
    price: 95,
    image: 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?q=80&w=800&auto=format&fit=crop',
    description: 'Toque profissional e moderno.',
    type: 'Formal',
    rating: 4.5
  },
  {
    id: '11',
    name: 'Saia Plissada',
    category: 'Mulher',
    price: 70,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
    description: 'Visual feminino e versátil.',
    type: 'Casual',
    rating: 4.3
  },
  {
    id: '14',
    name: 'Calções Cargo',
    category: 'Rapaz',
    price: 35,
    image: 'https://images.unsplash.com/photo-1520102143711-2098d5757d23?q=80&w=800&auto=format&fit=crop',
    description: 'Resistentes para qualquer aventura.',
    type: 'Casual',
    rating: 4.2
  },
  {
    id: '15',
    name: 'Camisola Polo',
    category: 'Rapaz',
    price: 30,
    image: 'https://images.unsplash.com/photo-1503944583220-79d172745161?q=80&w=800&auto=format&fit=crop',
    description: 'Visual arrumado para ocasiões especiais.',
    type: 'Formal',
    rating: 4.4
  },
  {
    id: '16',
    name: 'Corta-vento Kids',
    category: 'Rapaz',
    price: 50,
    image: 'https://images.unsplash.com/photo-1519457431-75514b72436e?q=80&w=800&auto=format&fit=crop',
    description: 'Proteção com muito estilo.',
    type: 'Desportivo',
    rating: 4.3
  },
  {
    id: '18',
    name: 'Cardigan Rosa',
    category: 'Rapariga',
    price: 35,
    image: 'https://images.unsplash.com/photo-1503919919749-646dd61a1631?q=80&w=800&auto=format&fit=crop',
    description: 'Aconchego para todos os momentos.',
    type: 'Casual',
    rating: 4.5
  },
  {
    id: '19',
    name: 'Leggings Star',
    category: 'Rapariga',
    price: 20,
    image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=800&auto=format&fit=crop',
    description: 'Conforto para brincar sem parar.',
    type: 'Desportivo',
    rating: 4.6
  },
  {
    id: '20',
    name: 'Macacão Jeans',
    category: 'Rapariga',
    price: 55,
    image: 'https://images.unsplash.com/photo-1515488503197-e23112bd2434?q=80&w=800&auto=format&fit=crop',
    description: 'Prático e cheio de personalidade.',
    type: 'Casual',
    rating: 4.4
  },
  {
    id: '21',
    name: 'Blusa Bordada',
    category: 'Rapariga',
    price: 30,
    image: 'https://images.unsplash.com/photo-1515223023032-1598585483f9?q=80&w=800&auto=format&fit=crop',
    description: 'Detalhes que fazem a diferença.',
    type: 'Formal',
    rating: 4.7
  },
  {
    id: '23',
    name: 'Conjunto Tricot',
    category: 'Bebé',
    price: 40,
    image: 'https://images.unsplash.com/photo-1555133742-1e967a14c000?q=80&w=800&auto=format&fit=crop',
    description: 'Clássico e quentinho.',
    type: 'Formal',
    rating: 4.8
  },
  {
    id: '24',
    name: 'Pijama Animais',
    category: 'Bebé',
    price: 25,
    image: 'https://images.unsplash.com/photo-1544126592-807daa2b56fd?q=80&w=800&auto=format&fit=crop',
    description: 'Sonhos divertidos garantidos.',
    type: 'Casual',
    rating: 4.7
  },
  {
    id: '26',
    name: 'Sapatinhos Soft',
    category: 'Bebé',
    price: 20,
    image: 'https://images.unsplash.com/photo-1515488764276-3d230b429d2f?q=80&w=800&auto=format&fit=crop',
    description: 'Primeiros passos com segurança.',
    type: 'Casual',
    rating: 4.5
  }
];
