// src/pages/test-error/page.tsx
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { useParams } from "react-router";

/**
 * Test component that deliberately triggers errors for testing the ErrorPage component
 */
const TestErrorPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();

  useEffect(() => {
    // We use a small timeout to ensure the component mounts before throwing errors
    const timer = setTimeout(() => {
      switch (type) {
        case "response":
          throw new Response("Testing an API error response", {
            status: 404,
            statusText: "Not Found",
          });
        case "error":
          throw new Error("Testing a JavaScript error");
        case "string":
          throw "Testing a string error";
        case "object":
          throw { message: "Testing an object error" };
        default:
          throw new Error(`Unknown error type: ${type}`);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [type]);

  // This will never render because errors are thrown in useEffect
  return (
    <Container maxWidth="md">
      <Box my={4} textAlign="center">
        <Typography variant="h4">Triggering Error...</Typography>
        <Typography variant="body1">
          If you see this, something went wrong with error triggering.
        </Typography>
      </Box>
    </Container>
  );
};

export default TestErrorPage;
