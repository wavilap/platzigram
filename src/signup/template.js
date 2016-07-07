var yo = require('yo-yo');

module.exports = yo`<div class="container">
    <div class="row">
      <div class="col s10 push-s1">
        <div class="row">
          
          <div class="col m5 hide-on-small-only">
            <img src="iphone.png" alt="" class="iphone responsive-img">
          </div>
          
          <div class="col s12 m7">
            <div class="row">
              <div class="signup-box">
                <h1 class="platzigram">Platzigram</h1>
                <form action="" class="signup-form">
                  <h2>Regístrate para ver fotos de tus amigos estudiando en Platzi</h2>
                  <div class="section">
                    <a href="" class="btn btn-fb hide-on-small-only">Iniciar sesión con Facebook</a>
                    <a href="" class="btn btn-fb hide-on-med-and-up">Iniciar sesión</a>
                  </div>
                  <div class="divider"></div>
                  <div class="section">
                    <input type="email" name="email" placeholder="Correo electrónico">
                    <input type="text" name="name" placeholder="Nombre completo">
                    <input type="text" name="username" placeholder="Nombre de usuario">
                    <input type="password" name="password" placeholder="Contraseña">
                    <button type="submit" class="btn waves-effect waves-light btn-signup">Regístrate</button>
                  </div>
                </form>
              </div>
            </div>
            <div class="row">
              <div class="login-box">
                ¿Tienes una cuenta? <a href="/signin">Entrar</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`