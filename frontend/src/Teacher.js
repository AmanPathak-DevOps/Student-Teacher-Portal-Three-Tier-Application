// Teacher.js — Final fixed version (consistent with Student.js)
import React, { useState, useEffect } from 'react';
import './Teacher.css';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Heading,
  Input,
  FormLabel,
  FormControl,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  useToast,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';

function Teacher() {
  const [teacherData, setTeacherData] = useState({ name: '', subject: '', class: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // console.log(`${API_BASE_URL}`);
  const getData = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/teacher`)
      .then((res) => res.json())
      .then((res) => {
        console.log('Fetched teachers:', res);
        setData(res || []);
      })
      .catch(() => toast({ title: 'Failed to load teachers', status: 'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    };
    fetch(`${API_BASE_URL}/addteacher`, requestOptions)
      .then((res) => res.json())
      .then(() => {
        toast({ title: 'Teacher added', status: 'success' });
        setTeacherData({ name: '', subject: '', class: '' });
        getData();
      })
      .catch(() => toast({ title: 'Error adding teacher', status: 'error' }));
  };

  const handleDelete = (id) => {
    fetch(`${API_BASE_URL}/teacher/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        toast({ title: 'Deleted', status: 'info' });
        getData();
      })
      .catch(() => toast({ title: 'Delete failed', status: 'error' }));
  };

  return (
    <Box>
      <Helmet>
        <title>Teachers • Student–Teacher Portal</title>
      </Helmet>

      <Heading mb={6}>Store Teacher Details</Heading>

      <Box as="form" onSubmit={handleSubmit} mb={8} maxW="lg">
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={teacherData.name}
              onChange={handleChange}
              placeholder="Enter teacher name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Subject</FormLabel>
            <Input
              name="subject"
              value={teacherData.subject}
              onChange={handleChange}
              placeholder="Enter subject"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Class</FormLabel>
            <Input
              name="class"
              value={teacherData.class}
              onChange={handleChange}
              placeholder="Enter class"
            />
          </FormControl>

          <HStack>
            <Button type="submit" colorScheme="teal">
              Save
            </Button>
          </HStack>
        </VStack>
      </Box>

      {loading ? (
        <LoadingSpinner />
      ) : data.length === 0 ? (
        <EmptyState title="No teachers" subtitle="Add your first teacher to see it here." />
      ) : (
        <Box overflowX="auto">
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Teacher ID</Th>
                <Th>Name</Th>
                <Th>Subject</Th>
                <Th>Class</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((d, i) => {
                // ✅ Flexible field handling
                const teacherId =
                  d.teacherId ||
                  d._id ||
                  d.id ||
                  d.TeacherID ||
                  `T-${i + 1}`;
                const name = d.name || d.teacherName || '—';
                const subject = d.subject || d.Subject || d.course || '—';
                const className = d.class || d.Class || d.standard || '—';
                const id = d._id || d.id || teacherId;

                return (
                  <Tr key={id}>
                    <Td fontWeight="bold">{teacherId}</Td>
                    <Td>{name}</Td>
                    <Td>{subject}</Td>
                    <Td>{className}</Td>
                    <Td textAlign="center">
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          <Text mt={3} fontSize="sm" color="gray.500">
            Showing {data.length} teacher{data.length > 1 ? 's' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Teacher;
