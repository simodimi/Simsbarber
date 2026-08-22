import Siderbar from "../components/Siderbar";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import down from "../assets/icone/aD.png";
import up from "../assets/icone/aU.png";
import { useState } from "react";
const About = () => {
  const navigate = useNavigate();
  const [hide, sethide] = useState({
    hide1: false,
    hide2: false,
    hide3: false,
    hide4: false,
    hide5: false,
  });
  return (
    <div className="AccueilHeader">
      <div className="AccueilHome">
        <Siderbar />
      </div>
      <div className="btnRetour">
        {" "}
        <Button className="succes" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
      <div className="AccueilPrestations">
        <div className="AccueilPrestationsTitle">
          <h2>Plus qu'un barbier, une expérience </h2>
        </div>
      </div>
      <div className="AboutMain">
        <div className="">
          <div className="AboutTitle">
            <h2>L'Authenticité :</h2>
            <div className="AboutBtn">
              <img
                src={hide.hide1 ? down : up}
                alt=""
                onClick={() => sethide({ ...hide, hide1: !hide.hide1 })}
              />
            </div>
          </div>

          {!hide.hide1 && (
            <p>
              Nous sommes fiers de nos racines. Nous utilisons des méthodes
              traditionnelles (rasoir droit, ciseaux) tout en les combinant avec
              les techniques les plus modernes. Pas de blabla, que du vrai
              travail.
            </p>
          )}
        </div>
        <div className="">
          <div className="AboutTitle">
            <h2>L'Excellence :</h2>
            <div className="AboutBtn">
              <img
                src={hide.hide2 ? up : down}
                alt=""
                onClick={() => sethide({ ...hide, hide2: !hide.hide2 })}
              />
            </div>
          </div>

          {hide.hide2 && (
            <p>
              La satisfaction de notre client est notre seul objectif. Nous
              n'arrêtons jamais de nous former pour vous offrir les meilleurs
              soins et les coupes les plus tendances. La qualité est notre
              maître-mot.
            </p>
          )}
        </div>
        <div className="">
          <div className="AboutTitle">
            <h2>L'Expérience :</h2>
            <div className="AboutBtn">
              <img
                src={hide.hide3 ? up : down}
                alt=""
                onClick={() => sethide({ ...hide, hide3: !hide.hide3 })}
              />
            </div>
          </div>

          {hide.hide3 && (
            <p>
              Entrez dans un salon, repartez avec une expérience. Chez nous,
              chaque visite est un moment de détente, un échange, un voyage dans
              l'univers du soin masculin. L'ambiance y est aussi soignée que
              votre coupe.
            </p>
          )}
        </div>

        <div className="">
          <div className="AboutTitle">
            <h2>Un Cadre Pensé Pour Vous</h2>
            <div className="AboutBtn">
              <img
                src={hide.hide4 ? up : down}
                alt=""
                onClick={() => sethide({ ...hide, hide4: !hide.hide4 })}
              />
            </div>
          </div>

          {hide.hide4 && (
            <p>
              Chez nous, chaque détail compte. Du fauteuil inclinable en cuir
              italien aux miroirs en laiton, en passant par l'éclairage tamisé
              qui met en valeur les finitions de votre coiffure. Notre salon est
              un cocon où le temps semble suspendu. Nous avons choisi des
              matériaux nobles pour vous offrir un cadre unique, alliant le
              charme du vintage au confort du moderne. C'est le lieu idéal pour
              s'évader le temps d'un service, loin du stress quotidien.
            </p>
          )}
        </div>
        <div className="">
          <div className="AboutTitle">
            <h2>Notre Localisation</h2>
            <div className="AboutBtn">
              <img
                src={hide.hide5 ? up : down}
                alt=""
                onClick={() => sethide({ ...hide, hide5: !hide.hide5 })}
              />
            </div>
          </div>
          {hide.hide5 && (
            <div className="iframe">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.998916512526!2d5.4341108766142625!3d43.24704707860431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9b8554a46376f%3A0xd30d42af04d68e89!2sALOTRA%20-%20R%C3%A9sidence%20pour%20%C3%A9tudiants!5e1!3m2!1sfr!2sfr!4v1782862552272!5m2!1sfr!2sfr"
                loading="lazy"
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
