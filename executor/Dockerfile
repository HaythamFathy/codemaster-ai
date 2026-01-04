# Use a lightweight Python base
FROM python:3.11-alpine

# Create a non-root user for security
# It is important to NOT run students' code as root
RUN adduser -D student
USER student

WORKDIR /home/student

# Copy the executor script
COPY --chown=student:student executor.py .

# Command to run. 
# We don't define a CMD that runs immediately because we expect the
# invoker (the backend) to pipe code into this container via stdin.
# Example usage: cat script.py | docker run -i --network none runner-image python executor.py
CMD ["python", "executor.py"]
