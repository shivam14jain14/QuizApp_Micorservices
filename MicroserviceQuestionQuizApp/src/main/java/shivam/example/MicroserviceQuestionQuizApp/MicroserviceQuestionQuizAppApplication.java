package shivam.example.MicroserviceQuestionQuizApp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MicroserviceQuestionQuizAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(MicroserviceQuestionQuizAppApplication.class, args);
	}

}
