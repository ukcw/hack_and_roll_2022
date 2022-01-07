import { Container, Flex, Heading } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

const getHistory = async () => {
  const url = `https://mongo-realm-worker.ulysseskcw96.workers.dev/api/attendance`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  });

  return resp.json();
};

const FrontPage = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    async function fetchMyAPI() {
      const data = await getHistory();
      if (data) {
        console.log(data);
      }
    }
    fetchMyAPI();
  }, []);

  return (
    <Container maxW="container.xl" p={0}>
      <Flex h="100vh" py={20}>
        <Heading>YOOOO</Heading>
      </Flex>
    </Container>
  );
};

export default FrontPage;
