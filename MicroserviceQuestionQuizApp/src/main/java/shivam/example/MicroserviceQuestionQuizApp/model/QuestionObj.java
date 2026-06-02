package shivam.example.MicroserviceQuestionQuizApp.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Data
@Component
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "question")
public class QuestionObj {
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private int id;
    private String category;
    @JsonAlias("questionTitle")
    private String question;
    @JsonAlias("rightAnswer")
    private String answer;
    @JsonAlias("difficultyLevel")
    private String difficultylevel;
    private String option1;
    private String option2;
    private String option3;
    private String option4;

    public int getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public String getCategory() {
        return category;
    }

    public String getAnswer() {
        return answer;
    }

    public String getDifficultylevel() {
        return difficultylevel;
    }

    public String getOption1() {
        return option1;
    }

    public String getOption2() {
        return option2;
    }

    public String getOption3() {
        return option3;
    }

    public String getOption4() {
        return option4;
    }
}
