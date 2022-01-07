import {
  Container,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
const _ = require("lodash");

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

function getDate(str) {
  const re = /(\d{2})(\d{2})(\d{4})/;
  const match = str.match(re);
  const d = match[1];
  const m = match[2];
  const y = match[3];
  const dateToConvert = `${y}-${m}-${d}`;
  const date = new Date(dateToConvert);
  return date;
}

const DisplayTable = (props) => {
  const dateResults = {};
  props.data.forEach((docu) => {
    let dateObj = getDate(docu.date);

    if (dateResults.hasOwnProperty(docu.date) === false) {
      // not in dateResults array, add to
      dateResults[dateObj] = [];
    }
  });

  const dateKeys = Object.keys(dateResults);
  const sortedDateKeys = _.sortBy(dateKeys, function (dateObj) {
    return new Date(dateObj);
  });

  props.data.forEach((docu) => {
    let dateObj = getDate(docu.date);
    dateResults[dateObj].push({ name: docu.name, status: docu.status });
  });

  console.log("dateRes", dateResults);
  console.log(dateKeys);
  console.log(sortedDateKeys);
  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Date</Th>
          <Th>Name</Th>
          <Th>Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedDateKeys.map((dKey) =>
          dateResults[dKey].map((entry) => (
            <Tr key={entry}>
              <Td>{dKey}</Td>
              <Td>{entry.name}</Td>
              <Td>{entry.status}</Td>
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};

const FrontPage = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    async function fetchMyAPI() {
      const data = await getHistory();
      if (data) {
        setHistoryData(data);
        console.log(data);
      }
    }
    fetchMyAPI();
  }, []);

  return (
    <Container maxW="container.xl" p={0}>
      <Flex h="120vh" py={20}>
        <VStack w="full">
          <Heading>Attendance History</Heading>
          <DisplayTable data={historyData} />
        </VStack>
      </Flex>
    </Container>
  );
};

export default FrontPage;
