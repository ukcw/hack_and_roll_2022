import {
  Container,
  Flex,
  Heading,
  Table,
  Tbody,
  Text,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Select,
  Stack,
  Button,
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
  const [dateFilter, setDateFilter] = useState("");
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

  function handleChange(e) {
    if (e.target.value) {
      setDateFilter(e.target.value);
    }
  }

  return (
    <>
      <Stack>
        <Select
          variant="outline"
          placeholder="Select date"
          value={dateFilter}
          onChange={(e) => handleChange(e)}
        >
          {sortedDateKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </Select>
        <Button
          colorScheme="gray"
          variant="outline"
          onClick={() => setDateFilter(false)}
        >
          See all
        </Button>
        )
      </Stack>
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Name</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedDateKeys.map((dKey) => {
            if (dateFilter) {
              if (dKey === dateFilter) {
                return dateResults[dKey].map((entry, i) => (
                  <Tr key={i}>
                    <Td>{dKey}</Td>
                    <Td>{entry.name}</Td>
                    <Td>{entry.status}</Td>
                  </Tr>
                ));
              }
            } else {
              return dateResults[dKey].map((entry, i) => (
                <Tr key={i}>
                  <Td>{dKey}</Td>
                  <Td>{entry.name}</Td>
                  <Td>{entry.status}</Td>
                </Tr>
              ));
            }
          })}
        </Tbody>
      </Table>
    </>
  );
};

const DefaultDisplay = () => {
  return <Text fontSize="6x1">No attendance data recorded</Text>;
};

const FrontPage = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    async function fetchMyAPI() {
      const data = await getHistory();
      if (data) {
        setHistoryData(data);
      }
    }
    fetchMyAPI();
  }, []);

  return (
    <Container maxW="container.xl" p={0}>
      <Flex h="120vh" py={20}>
        <VStack w="full">
          <Heading>Attendance History</Heading>
          {historyData.length ? (
            <DisplayTable data={historyData} />
          ) : (
            <DefaultDisplay />
          )}
        </VStack>
      </Flex>
    </Container>
  );
};

export default FrontPage;
