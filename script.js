let cart = [];
let modalQt = 1;
let modalKey = 0;

const q = (el)=>document.querySelector(el);
const qs = (el)=>document.querySelectorAll(el);


//Listagem de Pizzas
pizzaJson.map((item, index)=>{
  let pizzaItem = q('.models .pizza-item').cloneNode(true);

  pizzaItem.setAttribute('data-key', index);
  pizzaItem.querySelector('.pizza-item--img img').src = item.img;
  pizzaItem.querySelector('.pizza-item--name').innerHTML = item.name;
  pizzaItem.querySelector('.pizza-item--price').innerHTML = `R$ ${item.price.toFixed(2)}`;
  pizzaItem.querySelector('.pizza-item--desc').innerHTML = item.description;
  
  pizzaItem.querySelector('a').addEventListener('click', (e)=> {
    e.preventDefault(); //deixa o elemento clicado com configurações padrões
    let key = e.target.closest('.pizza-item').getAttribute('data-key'); //ao clicar no elemento a, vai procurar o elemento anterior mais próximo chamado .pizza-item
    modalQt = 1;
    modalKey = key;

    q('.pizzaBig img').src = pizzaJson[key].img; //preenche imagem no modal
    q('.pizzaInfo h1').innerHTML = pizzaJson[key].name;//preenche titulo no modal
    q('.pizzaInfo--desc').innerHTML = pizzaJson[key].description;//preenche descrição no modal
    q('.pizzaInfo--size.selected').classList.remove('selected');//remove a classe selected no inicio do modal
    qs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
      if(sizeIndex == 2) {
        size.classList.add('selected');
      }//adiciona a classe selected no modal
      size.querySelector('span').innerHTML = pizzaJson[key].sizes[sizeIndex];
    });//preenche pesos no modal
    q('.pizzaInfo--actualPrice').innerHTML = `R$ ${pizzaJson[key].price.toFixed(2)}`;//preenche preço no modal
    q('.pizzaInfo--qt').innerHTML = modalQt;

    q('.pizzaWindowArea').style.opacity = 0;//deixa transparente de inicio
    q('.pizzaWindowArea').style.display = 'flex';//mostra o modal
    setTimeout(() => {
      q('.pizzaWindowArea').style.opacity = 1;
    }, 200);
  });//no determinado tempo, transita do 0 para 1 a opacidade

  q('.pizza-area').append(pizzaItem);//pega o conteudo da area e adiciona mais 1 conteudo, sem substituir
});

// Eventos do modal
// função de fechar a tela do modal
function closeModal() {
  q('.pizzaWindowArea').style.opacity = 0;
  setTimeout(()=> {
    q('.pizzaWindowArea').style.display = 'none';
  }, 500)
};
qs('.pizzaInfo--cancelButton, .pizzaInfo--cancelMobileButton').forEach((item)=> {
  item.addEventListener('click', closeModal);
});// aqui ele verifica para cada item do qs o momento do click para executar a função

//se a quantidade do modalQT for > 1, permite diminuir a quantidade de itens
q('.pizzaInfo--qtmenos').addEventListener('click', () =>{
  if(modalQt>1){
    modalQt--;
    q('.pizzaInfo--qt').innerHTML = modalQt;
  }
});
//adiciona a quantidade de itens
q('.pizzaInfo--qtmais').addEventListener('click', () =>{
  modalQt++;
  q('.pizzaInfo--qt').innerHTML = modalQt;
});
//substitui a classe selected para qual foi clicado
qs('.pizzaInfo--size').forEach((size, sizeIndex)=>{
  size.addEventListener('click', ()=> {
    q('.pizzaInfo--size.selected').classList.remove('selected');
    size.classList.add('selected');
  });
});
//Adicionando infos no carrinho, ja temos o modalQT para quantidade e id com o modalKey definido no momento de abrir o modal
q('.pizzaInfo--addButton').addEventListener('click', () => {
  //busca o tamanho pelo data-key
  let size = parseInt(q('.pizzaInfo--size.selected').getAttribute('data-key'));

  // cria um identificador de modelo @ tamanho
  let identifier = pizzaJson[modalKey].id+'@'+size;

  //define variavel identifierExists caso encontrar no cart
  let identifierExists = cart.findIndex((item)=> item.identifier == identifier);

  //se o resultado for > -1, ele encontrou o modelo e tamanho de pizza, e assim somente somou as quantidades
  if(identifierExists > -1){
    cart[identifierExists].qt += modalQt;
  } 
  
  //se nao encontrar ou for a primeira vez que estiver sendo adicionado esse modelo e tamanho, simplesmente adiciona o objeto no cart
  else {
    //push() para adicionar no carrinho
    cart.push({
      identifier,
      id:pizzaJson[modalKey].id,
      size,
      qt: modalQt
    });
  }
  //executa funcao de atualizar o carrinho
  updateCart();
  //fechar modal ao clicar em adicionar
  closeModal();
});

q('.menu-openner').addEventListener('click', () => {
  if(cart.length > 0 ) {
    q('aside').style.left = '0';
  }
});
q('.menu-closer').addEventListener('click', () => {
  q('aside').style.left = '100vw';
})

//ATUALIZAR CARRINHO
function updateCart (){
  //atualiza a quantidade do carrinho para mobile
  q('.menu-openner span').innerHTML = cart.length;

  //se possuir 1 ou mais itens dentro do carrinho, faça...
  if (cart.length > 0) {
    //adiciona a class show para aparecer o carrinho
    q('aside').classList.add('show');
    //zerar o aside
    q('.cart').innerHTML = '';

    let subtotal = 0;
    let desconto = 0;
    let total = 0;

    //para cada item no carrinho
    for(let i in cart) {
      //procura a ID do item com a ID do pizzaJson
      let pizzaItem = pizzaJson.find((item)=> item.id == cart[i].id);
      //define o subtotal com preço do item * quantidade
      subtotal += pizzaItem.price * cart[i].qt;
      //clona a estrutura HTML do .cart--item
      let cartItem = q('.models .cart--item').cloneNode(true);
      //define um nome ficticio de acordo com a ID do size
      let pizzaSizeName;
      switch(cart[i].size) {
        case 0:
          pizzaSizeName = 'P';
          break;
        case 1:
          pizzaSizeName = 'M';
          break;
        case 2:
          pizzaSizeName = 'G';
          break;
      }
      //define variavel apenas com nome e tamanho
      let pizzaName = `${pizzaItem.name} (${pizzaSizeName})`;

      //preenche de acordo com o que foi coletado
      cartItem.querySelector('img').src = pizzaItem.img;
      cartItem.querySelector('.cart--item-nome').innerHTML = pizzaName;
      cartItem.querySelector('.cart--item--qt').innerHTML = cart[i].qt;
      //se tiver 1 ou mais, habilita para remover a quantidade
      cartItem.querySelector('.cart--item-qtmenos').addEventListener('click', ()=>{
        if(cart[i].qt > 1) {
          cart[i].qt--;
        } /* Se tiver zero, remove o item no modal */ else {
          cart.splice(i, 1);
        }
        //executa a propria função
        updateCart();
      })
      //permite adicionar mais quantidades ao clicar em +
      cartItem.querySelector('.cart--item-qtmais').addEventListener('click', ()=>{
        cart[i].qt++;
        updateCart();
      })
      //pega o conteudo do carrinho e adiciona mais 1 conteudo, sem substituir
      q('.cart').append(cartItem);
    }
    
    //define os valores de desconto e total e depois preenche com os query selector abaixo
    desconto = subtotal * 0.1;
    total = subtotal - desconto;
    q('.subtotal span:last-child').innerHTML = `R$ ${subtotal.toFixed(2)}`;
    q('.desconto span:last-child').innerHTML = `R$ ${desconto.toFixed(2)}`;
    q('.total span:last-child').innerHTML = `R$ ${total.toFixed(2)}`;


  } /* fecha o aside, pois nao tem itens pra mostrar */ else {
    q('aside').classList.remove('show');
    q('aside').style.left = '100vw';
  }
};