import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/auth";

import firebase from "../../services/firebaseConnection";
import { useHistory, useParams } from "react-router-dom";

import Header from "../../components/Header";
import Title from "../../components/Title";

import { toast } from "react-toastify";
import { FiPlusCircle } from "react-icons/fi";
import "./new.css";

export default function New() {
  const { id } = useParams();
  const history = useHistory();

  const [costumers, setCostumers] = useState([]);
  const [loadCostumers, setLoadCostumers] = useState(true);
  const [costumersSelected, setCostumersSelected] = useState(0);

  const [assunto, setAssunto] = useState("Suporte");
  const [status, setStatus] = useState("Aberto");
  const [complemento, setComplemento] = useState("");

  const [idCostumer, setIdCostumer] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function loadCostumers() {
      await firebase
        .firestore()
        .collection("costumers")
        .get()
        .then((snapshot) => {
          let lista = [];

          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              nomeFantasia: doc.data().nomeFantasia,
            });
          });
          if (lista.length === 0) {
            console.log("Nenhuma empresa encontrada");
            setLoadCostumers(false);
            setCostumers([{ id: "1", nomeFantasia: "" }]);
            return;
          }
          setCostumers(lista);
          setLoadCostumers(false);

          if (id) {
            loadId(lista);
          }
        })
        .catch((error) => {
          console.log(error);
          setLoadCostumers(false);
          setCostumers([{ id: "1", nomeFantasia: "" }]);
        });
    }

    loadCostumers();
  }, [id]);

  async function loadId(lista) {
    await firebase
      .firestore()
      .collection("chamados")
      .doc(id)
      .get()
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);

        let index = lista.findIndex(
          (item) => item.id === snapshot.data().clienteId
        );
        setCostumersSelected(index);
        setIdCostumer(true);
      })
      .catch((error) => {
        console.error(error);
        setIdCostumer(false);
      });
  }

  async function handleRegister(e) {
    e.preventDefault();

    if(idCostumer){
      await firebase.firestore().collection("chamados")
      .doc(id)
      .update({
        //para que o usuário consiga fazer atualização no chamado
        //e agora vou mandar as informações
        cliente: costumers[costumersSelected].nomeFantasia,
        clienteId: costumers[costumersSelected].id,
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid,
      })
      .then(()=>{
        toast.success("Chamado editado com sucesso!")
        setCostumersSelected(0);
        setComplemento("");
        history.push("/dashboard");
      })
      .catch((error)=>{
        toast.error("Erro ao registrar, por favor, tente mais tarde.")
        console.log(error)
      })
      return;
    }

    await firebase
      .firestore()
      .collection("chamados")
      .add({
        created: new Date(),
        cliente: costumers[costumersSelected].nomeFantasia,
        clienteId: costumers[costumersSelected].id,
        assunto: assunto,
        status: status,
        complemento: complemento,
        userId: user.uid,
      })
      .then(() => {
        toast.success("Chamado registrado com sucesso!");
        setComplemento("");
        setCostumersSelected(0);
      })
      .catch((error) => {
        toast.error("Erro ao registrar chamado!");
        console.log(error);
      });
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }

  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  function handleChangeCostumers(e) {
    setCostumersSelected(e.target.value);
  }

  return (
    <div>
      <Header />

      <div className="content">
        <Title name="Novo chamado">
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Cliente</label>

            {loadCostumers ? (
              <input
                type="text"
                disabled={true}
                value="Carregando clientes..."
              />
            ) : (
              <select
                value={costumersSelected}
                onChange={handleChangeCostumers}
              >
                {costumers.map((item, index) => {
                  return (
                    <option key={item.id} value={index}>
                      {item.nomeFantasia}
                    </option>
                  );
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita Tecnica">Visita Tecnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                onChange={handleOptionChange}
                checked={status === "Aberto"}
              />
              <span>Em Aberto</span>

              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                checked={status === "Progresso"}
              />
              <span>Em Progresso</span>

              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                checked={status === "Atendido"}
              />
              <span>Atendido</span>
            </div>

            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema(opcional)."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />

            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
